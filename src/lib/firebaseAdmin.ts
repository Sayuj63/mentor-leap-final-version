import * as admin from "firebase-admin";

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined,
};

function getFirebaseAdmin() {
    if (!admin.apps.length) {
        if (!firebaseAdminConfig.privateKey || !firebaseAdminConfig.clientEmail) {
            throw new Error("Firebase Admin credentials missing. Please add FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL to your .env.local file.");
        }
        try {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig as any),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } catch (error: any) {
            throw new Error("Failed to initialize Firebase Admin: " + error.message);
        }
    }
    return admin;
}

// Proxy-based wrappers to ensure we only call getFirebaseAdmin() when needed 
// and still provide access to all underlying methods
export const db = new Proxy({}, {
    get(target, prop) {
        const firestore = getFirebaseAdmin().firestore();
        const value = (firestore as any)[prop];
        return typeof value === 'function' ? value.bind(firestore) : value;
    }
}) as any;

export const auth = new Proxy({}, {
    get(target, prop) {
        const authService = getFirebaseAdmin().auth();
        const value = (authService as any)[prop];
        return typeof value === 'function' ? value.bind(authService) : value;
    }
}) as any;

export const storage = new Proxy({}, {
    get(target, prop) {
        const storageService = getFirebaseAdmin().storage();
        const value = (storageService as any)[prop];
        return typeof value === 'function' ? value.bind(storageService) : value;
    }
}) as any;

export { admin };
