"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  getUserData,
  createUser,
  checkAdminStatus,
} from "@/lib/functions/userFunctions";
import { hasPaymentAccess } from "@/lib/utils/subscription-utils";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      console.log("User signed out");
      // Always redirect to signin after logout
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const checkUserAdminStatus = async (uid) => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }

    setAdminLoading(true);
    try {
      const adminStatus = await checkAdminStatus(uid);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateUser = async (user) => {
    try {
      const userData = await createUser(user);
      setUserData(userData);
      // Check admin status after getting user data
      await checkUserAdminStatus(user.uid);
    } catch (error) {
      console.error("Error creating/fetching user:", error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.uid);
      setUserData(data);
      // Refresh admin status as well
      await checkUserAdminStatus(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        setUser(user);
        await handleCreateUser(user);
        const hasAccess = await hasPaymentAccess(userData.id);
        if (hasAccess) {
          router.push("/tasks");
        }
        const hasShownPricing = await hasShownPricing(userData.id);
        if (!hasShownPricing) {
          router.push("/pricing");
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        const pathname = window.location.pathname;

        // Only redirect to signin if not already on an auth page or home
        if (!pathname.startsWith("/auth/") && pathname !== "/") {
          router.push("/auth/signin");
        }
      }

      setLoading(false);
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const value = {
    user,
    userData,
    isAdmin,
    adminLoading,
    loading,
    initialLoading,
    logout,
    getUserData,
    refreshUserData,
    checkUserAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
