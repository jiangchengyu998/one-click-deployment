"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/check-login", {
                cache: "no-store",
            });
            const data = await response.json();

            if (response.ok && data.isLoggedIn) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("检查登录状态失败:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const logout = useCallback(async (redirectTo = "/") => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("退出登录失败:", error);
        } finally {
            setUser(null);
            router.push(redirectTo);
            router.refresh();
        }
    }, [router]);

    const value = useMemo(() => ({
        user,
        isLoading,
        isLoggedIn: Boolean(user),
        refreshAuth,
        logout,
    }), [user, isLoading, refreshAuth, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth 必须在 AuthProvider 内使用");
    }

    return context;
}
