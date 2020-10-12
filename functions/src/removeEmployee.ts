import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default async (companyId:string, employeeId:string) => {
    const company = (await admin.firestore()
                            .doc(`companies/${companyId}`)
                            .get())
                            .data();

    if (!company) {
        throw new functions.https.HttpsError('invalid-argument', 'The companyId is invalid.');
    }

    const employee = (await admin.firestore()
                            .doc(`companies/${companyId}/employees/${employeeId}`)
                            .get())
                            .data();

    if (!employee) {
        throw new functions.https.HttpsError('invalid-argument', 'The employeeId is invalid.');
    }

    if (employee.enrolledCourses.length > 0) {
        throw new functions.https.HttpsError('failed-precondition', 'The user has already enrolled in a course.');
    }

    // Delete User
    await admin.auth()
        .deleteUser(employee.uid)
        .catch(error => {
            throw new functions.https.HttpsError('internal', 'The user could not be deleted', error);
        });

    // Delete Employee record
    await admin.firestore()
            .doc(`/companies/${companyId}/employees/${employeeId}`)
            .delete()
            .catch(error => {
                throw new functions.https.HttpsError('internal', 'The employee record could not be deleted', error);
            });

    // Send removal notification
    if (employee.email) {
        await admin.firestore()
                .collection('mail')
                .add({
                    to: employee.email,
                    message: {
                        subject: `You've been removed from ${company.name}.`,
                        html: `Sorry <strong>${employee.name}</strong>, you've been removed from ${functions.config().business.name} by an admin for <strong>${company.name}</strong>. 
                        <br/>Unfortunately, this means that you will no longer be able to sign in to your account and learn.
                        <br/>We hope to see you again in the near future.
                        <br/>Thank You.`,
                    }
                })
                .catch(error => {
                    throw new functions.https.HttpsError('internal', 'The mail record could not be added', error);
                });
    }
};