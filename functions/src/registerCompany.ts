import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default functions.https.onCall(async (data, context) => {
    try {
        // Get Authenticated User
        const auth = context.auth;

        if (!auth) {
            throw new functions.https.HttpsError('permission-denied', 'You are not authorized to call this function');
        }

        const user = await admin.auth().getUser(auth.uid);

        // Register User
        await admin.firestore().collection('companies').add({
            ...data,
            admin: {
                name: user.displayName,
                email: user.email,
                uid: user.uid,
            },
            subscription: {
                plan: admin.firestore().doc(`plans/${data.subscription.planId}`),
            }
        });

        // Send Welcome Email
        if (user.email) {
            const businessName = functions.config().business.name;

            await admin.firestore().collection('mail').add({
                to: user.email,
                message: {
                    subject: `Welcome to ${businessName}!`,
                    text:   `Welcome to ${businessName}! We hope you find great value in our products and services.`,
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