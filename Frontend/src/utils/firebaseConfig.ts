"use client";

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    type Auth,
    onAuthStateChanged,
} from "firebase/auth";
import { getMessaging, type Messaging, getToken, onMessage } from "firebase/messaging";

const isBrowser = globalThis.window !== undefined;

const app: FirebaseApp | undefined = isBrowser ? initializeApp({
    apiKey: "AIzaSyDui5MKg4sB4eEcMjgjVXnw-u6bLm90D4E",
    authDomain: "scribe-c7f13.firebaseapp.com",
    projectId: "scribe-c7f13",
    storageBucket: "scribe-c7f13.firebasestorage.app",
    messagingSenderId: "970064337409",
    appId: "1:970064337409:web:ab8ecc361e352c5025be00",
    measurementId: "G-NH06MQQ2J3",
}) : undefined;

const auth: Auth | undefined = app ? getAuth(app) : undefined;
const googleProvider: GoogleAuthProvider | undefined = isBrowser ? new GoogleAuthProvider() : undefined;
const azureProvider: OAuthProvider | undefined = isBrowser ? new OAuthProvider('microsoft.com') : undefined;

const messaging: Messaging | undefined = (() => {
    try {
        return app ? getMessaging(app) : undefined;
    } catch (error) {
        console.warn('Firebase messaging initialization failed:', error);
        return undefined;
    }
})();

export { app, auth, googleProvider, azureProvider, messaging, onAuthStateChanged, getToken, onMessage };

export function isFirebaseReady(): boolean {
    return isBrowser && !!app && !!auth;
}
