import * as admin from 'firebase-admin';
import serviceAccount from "./firebase-admin-services.json";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const auth: admin.auth.Auth = admin.auth();

export const verifyAuth = async (req: Request) => {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return null;
  return await auth.verifyIdToken(token);
};
