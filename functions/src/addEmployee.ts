import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default async (companyId:string, employee:any) => {
    const company = (await admin.firestore()
                            .doc(`companies/${companyId}`)
                            .get())
                            .data();

    if (!company) {
        throw new functions.https.HttpsError('invalid-argument', 'The companyId is invalid.');
    }

    if (!company.subscription.plan) {
        throw new functions.https.HttpsError('failed-precondition', 'There is no plan set for the company.');
    }

    const plan = company.subscription.plan;

    const employeesCount = (await admin.firestore()
                                    .collection(`companies/${companyId}/employees`)
                                    .get())
                                    .size;

    if (plan && plan.licensedNumberOfEmployees >= employeesCount) {
        throw new functions.https.HttpsError('failed-precondition', 'You have exceeded the allowed number of emplyees for your plan.');
    }

    // Create User
    const user = await admin.auth()
                        .createUser({
                            email: employee.email,
                            displayName: employee.name,
                        })
                        .catch(error => {
                            if (error.code === 'auth/email-already-exists') {
                                throw new functions.https.HttpsError('failed-precondition', error.message);
                            }

                            throw error;
                        });

    // Set Claims 
    await admin.auth()
            .setCustomUserClaims(user.uid, { accessLevel: 'employee' })
            .catch(error => {
                throw new functions.https.HttpsError('internal', 'The custom claims could not be set on this user', error);
            });

    // Add Employee record
    await admin.firestore()
            .collection(`companies/${companyId}/employees`)
            .add({ 
                ...employee, 
                enrolledCourses: [],
                createdAt: admin.firestore.FieldValue.serverTimestamp() 
            })
            .catch(error => {
                throw new functions.https.HttpsError('internal', 'The employee record could not be created', error);
            });

    // Send passwordless sign-in link
    if (user.email) {
        const actionCodeSettings = {
            url: functions.config().auth.employee_app_domain,
            handleCodeInApp: true,
        };

        const signInLink = await admin.auth()
                                    .generateSignInWithEmailLink(user.email, actionCodeSettings)
                                    .catch(error => {
                                        throw new functions.https.HttpsError('internal', 'The sign-in link could not be generated', error);
                                    });

        await admin.firestore()
                .collection('mail').add({
                    to: user.email,
                    message: {
                        subject: `Welcome to ${functions.config().business.name}!`,
                        html: `<b>Welcome ${employee.name}!</b> <br/><br/>Kindly use <a href="${signInLink}">this link</a> to sign in anytime you want to learn!<br/><br/>Cheers!`,
                    }
                })
                .catch(error => {
                    throw new functions.https.HttpsError('internal', 'The mail record could not be added', error);
                });
    }
};