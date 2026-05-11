
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Fallback router for environments without next/navigation
let useRouter: () => { push: (href: string) => void };

try {
  // @ts-ignore
  const mod = require('next/navigation');
  // @ts-ignore
  useRouter = mod.useRouter;
} catch {
  // Fallback to legacy router if available
  // @ts-ignore
  const mod2 = require('next/router');
  // @ts-ignore
  useRouter = mod2.useRouter;
}

export interface User {
    name: string;
    email: string;
    role: 'admin' | 'master';
    companyName?: string;
    numPrinters?: string;
    country?: string;
    industry?: string;
    avatar?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    signupWithEmail: (signupData: Omit<User, 'role'> & {password: string}) => Promise<boolean>;
    loginWithEmail: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleUser = useCallback((rawUser: User | null, additionalData?: Partial<User>): User | null => {
        if (rawUser && rawUser.email) {
            if (rawUser.email === 'demo@prysm.com') {
                localStorage.setItem('isDemoUser', 'true');
                const demoUser: User = { name: 'Demo User', email: 'demo@prysm.com', role: 'admin', ...additionalData };
                localStorage.setItem('user', JSON.stringify(demoUser));
                setUser(demoUser);
                return demoUser;
            }

            localStorage.removeItem('isDemoUser');

            if (rawUser.email === 'LAD@PRYYSM' || rawUser.email === 'LAD@admin.com') {
                const masterUser: User = {
                    name: 'LAD',
                    email: rawUser.email,
                    role: 'master',
                    avatar: rawUser?.avatar,
                    ...additionalData
                };
                 localStorage.setItem('user', JSON.stringify(masterUser));
                 setUser(masterUser);
                 return masterUser;
            }

            const userData: User = {
                name: rawUser.name || 'User',
                email: rawUser.email!,
                role: 'admin',
                avatar: rawUser?.avatar || undefined,
                ...additionalData
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } else {
            localStorage.removeItem('isDemoUser');
            localStorage.removeItem('user');
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        // Check for existing user session on component mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch {
                // Corrupted data
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);
    
    const navigateAfterLogin = (loggedInUser: User | null) => {
         if (loggedInUser) {
            console.log('✅ navigateAfterLogin - User logged in:', loggedInUser.email, 'Role:', loggedInUser.role);
            console.log('🔄 Scheduling navigation with 150ms delay to ensure state update');
            
            // CRITICAL: Must delay to ensure React state updates propagate before navigation
            // ProtectedRoute checks isAuthenticated which depends on state being updated
            setTimeout(() => {
                console.log('🔄 Delay complete, now calling router.push()');
                try {
                    if (loggedInUser.role === 'master') {
                        console.log('🔄 Redirecting to master-admin');
                        router.push('/master-admin');
                    } else {
                        console.log('🔄 Redirecting to dashboard');
                        router.push('/dashboard');
                    }
                    console.log('✅ router.push() called successfully');
                } catch (err) {
                    console.error('❌ Error calling router.push:', err);
                }
            }, 150);
            return true;
        }
        console.log('❌ navigateAfterLogin - No user provided');
        return false;
    }

    const signupWithEmail = async (signupData: Omit<User, 'role'> & {password: string}): Promise<boolean> => {
        const { email, name, password, ...rest } = signupData;
        try {
            console.log('📝 Signup attempt:', email);
            
            // Call signup API
            console.log('📤 Sending signup request to /api/auth/signup...');
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    companyName: rest.companyName,
                    numPrinters: rest.numPrinters,
                    country: rest.country,
                    industry: rest.industry,
                }),
            });

            console.log('📥 Signup response status:', response.status);

            if (!response.ok) {
                try {
                    const error = await response.json();
                    console.error('❌ Signup failed:', error.error);
                } catch {
                    console.error('❌ Signup failed with status:', response.status);
                }
                return false;
            }

            const data = await response.json();
            console.log('✅ Signup response received:', { success: data.success, hasUser: !!data.user });
            
            if (!data.success || !data.user) {
                console.error('❌ Signup response indicates failure:', data);
                return false;
            }

            const { user: apiUser } = data;
            console.log('✅ Signup successful:', apiUser.email);

            // Convert API user to app user format
            const appUser = handleUser({
                name: apiUser.name,
                email: apiUser.email,
                role: 'admin',
                companyName: apiUser.companyName,
                numPrinters: apiUser.numPrinters,
                country: apiUser.country,
                industry: apiUser.industry,
                avatar: apiUser.avatar,
            });

            localStorage.setItem('new_signup', 'true');
            return navigateAfterLogin(appUser);
        } catch (error) {
            console.error("❌ Signup Error:", error);
            return false;
        }
    };
    
    const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
        console.log('🔐 Login attempt:', email);
        
        try {
            // Call login API
            console.log('📤 Sending login request to /api/auth/login...');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });

            console.log('📥 Login response status:', response.status);

            if (!response.ok) {
                try {
                    const error = await response.json();
                    console.error('❌ Login failed:', error.error);
                } catch {
                    console.error('❌ Login failed with status:', response.status);
                }
                return false;
            }

            const data = await response.json();
            console.log('✅ Login response received:', { hasUser: !!data.user, email: data.user?.email });
            
            if (!data.success || !data.user) {
                console.error('❌ Login response indicates failure:', data);
                return false;
            }

            const { user: apiUser } = data;
            console.log('✅ Database login successful:', apiUser.email);

            // Convert API user to app user format
            const userToLogin: User = {
                name: apiUser.name,
                email: apiUser.email,
                role: apiUser.role === 'master' ? 'master' : 'admin',
                companyName: apiUser.companyName,
                numPrinters: apiUser.numPrinters,
                country: apiUser.country,
                industry: apiUser.industry,
                avatar: apiUser.avatar,
            };

            const result = handleUser(userToLogin);
            console.log('✅ handleUser returned:', result);
            const navigateResult = navigateAfterLogin(result);
            console.log('✅ navigateAfterLogin result:', navigateResult);
            return navigateResult;
        } catch (error) {
            console.error('❌ Login error:', error);
            // Fallback: Try demo account for backward compatibility
            if (email === 'demo@prysm.com' && pass === 'demo123') {
                console.log('✅ Demo user credentials matched (fallback)');
                const userToLogin: User = { name: 'Demo User', email, role: 'admin' };
                const result = handleUser(userToLogin);
                const navigateResult = navigateAfterLogin(result);
                return navigateResult;
            }
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isDemoUser');
        setUser(null);
        router.push('/login');
    };

    const updateUserProfile = (updates: Partial<User>) => {
        if(user) {
            const updatedUser = {...user, ...updates};
            handleUser(updatedUser);
        }
    };

    const value: AuthContextType = {
        isAuthenticated: !!user,
        user,
        isLoading,
        signupWithEmail,
        loginWithEmail,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

