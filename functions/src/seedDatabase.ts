import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const now = () => {
    return new Date().getTime();
};

export default async () => {
    try {
        // Create User
        const user = await admin.auth().createUser({
            email: 'wedamja@gmail.com',
            emailVerified: true,
            phoneNumber: '+233509297419',
            password: 'password',
            displayName: 'Wedam Anewenah',
            disabled: false
        });

        // Create Admin Record
        admin.firestore().doc(`/admins/${user.uid}`).set({
            name: 'Wedam Anewenah',
            email: 'wedamja@gmail.com',
            createdOn: now(),
        }).catch(error => {
            throw new functions.https.HttpsError('internal', 'The Admin record could not be created', error);
        });

        // Create Company and Company Admin Records
        const companyReference = admin.firestore().collection('/companies').doc().path;

        admin.firestore().doc(companyReference).set({
            name: 'MTN Ghana',
            email: user.email,
            admin: {
                uid: user.uid,
                name: 'Wedam Anewenah',
                email: 'wedamja@gmail.com'
            },
            logo: {
                src: 'data:image/png;base64,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',
            },
            createdOn: now(),
        }).catch(error => {
            throw new functions.https.HttpsError('internal', 'The Company record could not be created', error);
        });

        // Set Admin Claims 
        admin.auth().setCustomUserClaims(user.uid, {accessLevel: 'admin'}).catch(error => {
            throw new functions.https.HttpsError('internal', 'The custom claims could not be set on this user', error);
        });
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
};