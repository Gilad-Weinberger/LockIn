"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUserData, createUser } from "@/lib/functions/userFunctions";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      console.log("User signed out");
      // Always redirect to signin after logout
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleCreateUser = async (user) => {
    try {
      const userData = await createUser(user);
      setUserData(userData);
    } catch (error) {
      console.error("Error creating/fetching user:", error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.uid);
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        setUser(user);
        await handleCreateUser(user);
      } else {
        setUser(null);
        setUserData(null);
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
    loading,
    initialLoading,
    logout,
    getUserData,
    refreshUserData,
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
