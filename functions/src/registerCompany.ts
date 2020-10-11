import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default async (uid:string, company:any) => {
    try {
        const user = await admin.auth().getUser(uid);

        // Register User
        await admin.firestore().collection('companies').add({
            ...company,
            admin: {
                name: user.displayName,
                email: user.email,
                uid: user.uid,
            },
            subscription: {
                plan: admin.firestore().doc(`plans/${company.subscription.planId}`),
            },
            employeesTotalCount: 0,
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
};