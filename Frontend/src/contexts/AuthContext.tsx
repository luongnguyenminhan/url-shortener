import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            if (auth) await auth.signOut();
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        if (!auth) {
            console.error("Auth instance is not available");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Auth State Changed:", firebaseUser ? "User found" : "No user");
            try {
                if (firebaseUser) {
                    console.log("Getting ID Token...");
                    const idToken = await firebaseUser.getIdToken();
                    console.log("ID Token obtained, calling backend...");

                    try {
                        const loginResponse = await authService.loginWithFirebase(idToken);
                        console.log("Backend response:", loginResponse);

                        if (loginResponse.success) {
                            localStorage.setItem("access_token", loginResponse.data.token.access_token);
                            localStorage.setItem("refresh_token", loginResponse.data.token.refresh_token);

                            setUser(firebaseUser); // Keeping firebaseUser for now as UI uses it, but we might want to extend it or usage
                            console.log("User set in context");
                        } else {
                            console.error("Backend login failed:", loginResponse.message);
                            // Force logout if backend login fails
                            await logout();
                        }
                    } catch (apiError) {
                        console.error("API Authentication error:", apiError);
                        // Force logout if API fails
                        await logout();
                    }
                } else {
                    // User is signed out
                    console.log("User signed out, clearing context");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth state change error:", error);
                setUser(null);
            } finally {
                setLoading(false);
                console.log("Loading set to false");
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
