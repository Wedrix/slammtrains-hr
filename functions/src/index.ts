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
import removeEmployee from './removeEmployee';

interface Auth {
    uid: string,
    token: admin.auth.DecodedIdToken,
};

const authorizeRequestForHR = async (auth:Auth | undefined) => {
    if (!auth) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to call this function');
    }

    const authUserRecord = await admin.auth().getUser(auth.uid);
    const customClaims = authUserRecord.customClaims; 

    if (!customClaims) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to call this function');     
    }

    if (customClaims.accessLevel !== 'hr') {
        throw new functions.https.HttpsError('permission-denied', 'You are not authroized to call this function');
    }
};

exports.seedDatabase = functions.https.onCall(async () => {
    try {
        await seedDatabase();
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});

exports.signUpHR = functions.https.onCall(async data => {
    try {
        await signUpHR(data);
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});

exports.registerCompany = functions.https.onCall(async (data, context) => {
    try {
        await authorizeRequestForHR(context.auth);
        
        if (context.auth) {
            const uid = context.auth.uid;
        
            await registerCompany(uid, data);
        }
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});

exports.addEmployee = functions.https.onCall(async (data, context) => {
    try {
        await authorizeRequestForHR(context.auth);
    
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

exports.removeEmployee = functions.https.onCall(async (data, context) => {
    try {
        await authorizeRequestForHR(context.auth);
    
        const { companyId, employeeId } = data;
    
        await removeEmployee(companyId, employeeId);
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