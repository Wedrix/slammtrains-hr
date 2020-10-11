import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';

admin.initializeApp(functions.config().firebase);

import seedDatabase from './seedDatabase';
import signUpHR from './signUpHR';
import registerCompany from './registerCompany';
import addEmployee from './addEmployee';
import importEmployees from './importEmployees';

exports.seedDatabase = functions.https.onCall(async () => {
    await seedDatabase();
});

exports.signUpHR = functions.https.onCall(async data => {
    const HR = data;

    await signUpHR(HR);
});

exports.registerCompany = functions.https.onCall(async (data, context) => {
    const auth = context.auth;
    const company = data;

    if (!auth) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to call this function');
    }

    await registerCompany(auth.uid, company);
});

exports.addEmployee = functions.https.onCall(async (data, context) => {
    try {
        const auth = context.auth;
    
        if (!auth) {
            throw new functions.https.HttpsError('permission-denied', 'You are not authorized to call this function');
        }
    
        const { companyId, employee } = data;
    
        await addEmployee(companyId, employee);
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});

exports.importEmployeesOnCSVUpload = functions.storage.object().onFinalize(async object => {
    try {
        // Run the function
        const fileBucket = object.bucket;
        const filePath = object.name;
    
        if (filePath) {
            // Get the file name.
            const fileName = path.basename(filePath); 
            const dirName = path.dirname(filePath);
    
            // Return if this is triggered on a file that is not a csv
            if (!fileName.match(/.csv/gi)) {
                return;
            }
    
            // Return if this is triggered on a csv that does not contain employee data
            if (!dirName.endsWith('/employees')) {
                return;
            }
        
            // Download file from bucket.
            const bucket = admin.storage().bucket(fileBucket);
            const tempFilePath = path.join(os.tmpdir(), fileName);
        
            try {
                await bucket.file(filePath).download({destination: tempFilePath}); 
            } catch (error) {
                throw new functions.https.HttpsError('internal', 'Error downloading CSV file', error);
            }

            const companyId = dirName.split('/')[1];

            importEmployees(tempFilePath, companyId);
        }
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});

exports.incrementEmployeesTotalCountOnCreate = functions.firestore
                                                    .document(`/companies/{companyId}/employees/{employeeId}`)
                                                    .onCreate(async (documentSnapshot, context) => {
                                                        // Run Function
                                                        const companyId = context.params.companyId;

                                                        try {
                                                            await admin.firestore()
                                                                    .doc(`companies/${companyId}`)
                                                                    .update('employeesTotalCount', admin.firestore.FieldValue.increment(1));
                                                        } catch (error) {
                                                            return Promise.reject(error);
                                                        }

                                                        return Promise.resolve();
                                                    });

exports.decrementEmployeesTotalCountOnDelete = functions.firestore
                                                    .document(`/companies/{companyId}/employees/{employeeId}`)
                                                    .onDelete(async (documentSnapshot, context) => {
                                                        // Run Function
                                                        const companyId = context.params.companyId;

                                                        try {
                                                            await admin.firestore()
                                                                    .doc(`companies/${companyId}`)
                                                                    .update('employeesTotalCount', admin.firestore.FieldValue.increment(-1));
                                                        } catch (error) {
                                                            return Promise.reject(error);
                                                        }

                                                        return Promise.resolve();
                                                    });