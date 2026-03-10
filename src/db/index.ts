import { applicationDefault, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { config } from '../config.js'; // Needed to ensure dotenv ran first

export let db: Firestore;

export function initDb() {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        // En Render, leemos directamente las credenciales de las variables de entorno para evitar subir el JSON
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escapes to ensure multiline private key works correctly from a string
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    } else {
        // Localmente sigue usando auth default (service-account.json vía GOOGLE_APPLICATION_CREDENTIALS)
        initializeApp({
            credential: applicationDefault()
        });
    }

    db = getFirestore();
    console.log('[DB] Conectado a Firebase Firestore exitosamente.');
}
