"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/models/User";
import { ADMIN_CONFIG } from "@/lib/constants";

interface AuthContextType {
    user: FirebaseUser | null;
    userData: User | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc: (() => void) | undefined;
        let unsubscribeAuth: (() => void) | undefined;

        if (!auth || !auth.app) {
            console.warn("Firebase Auth is not initialized.");
            setLoading(false);
            return;
        }

        try {
            unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
                setUser(currentUser);

                if (currentUser) {
                    // Set cookie for middleware
                    currentUser.getIdToken().then(token => {
                        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
                    });

                    // Real-time listener for user document
                    unsubscribeDoc = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
                        if (userDoc.exists()) {
                            setUserData(userDoc.data() as User);
                        } else {
                            setUserData(null);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Error listening to user data:", error);
                        setLoading(false);
                    });
                } else {
                    // Clear cookie
                    document.cookie = "firebase-token=; path=/; max-age=0";
                    setUserData(null);
                    setLoading(false);
                    if (unsubscribeDoc) unsubscribeDoc();
                }
            });
        } catch (err) {
            console.error("Failed to initialize Firebase Auth listener:", err);
            setLoading(false);
        }

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const logout = async () => {
        document.cookie = "firebase-token=; path=/; max-age=0";
        await auth.signOut();
    };

    const isAdmin = !!(userData?.role === "admin" || (user?.email && ADMIN_CONFIG.superAdminEmails.includes(user.email.toLowerCase())));

    return (
        <AuthContext.Provider value={{ user, userData, loading, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
