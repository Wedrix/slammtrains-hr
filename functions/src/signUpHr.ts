import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default functions.https.onCall(async data => {
    try {
        // Create User
        const user = await admin.auth().createUser({ ...data });

        // Set Claims 
        await admin.auth().setCustomUserClaims(user.uid, { accessLevel: 'hr' }).catch(error => {
            throw new functions.https.HttpsError('internal', 'The custom claims could not be set on this user', error);
        });

        // Send email verification link
        if (user.email) {
            const emailVerificationLink = await admin.auth().generateEmailVerificationLink(user.email);

            await admin.firestore().collection('mail').add({
                to: user.email,
                message: {
                    subject: 'Verify your email',
                    text: emailVerificationLink,
                }
            }).catch(error => {
                throw new functions.https.HttpsError('internal', 'The mail record could not be added', error);
            });
        }

    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
});