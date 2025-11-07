"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, useSession, getSession } from "next-auth/react"

// Create the auth context
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { data: session, status  } = useSession()
  const router = useRouter()
  const loading = status === "loading"
  const [user, setUser] = useState(null)

  const formatUser = (sessionUser) => {
    if (!sessionUser) return null;

    return {
      ...sessionUser,
      subscription: (() => {
        const sub = sessionUser.subscription;
        if (!sub) return null;
        if (typeof sub === "string") return sub;
        if (typeof sub === "object") {
          const { plan, status } = sub;
          return `${plan} (${status})`;
        }
        return null;
      })(),
    };
  };

  useEffect(() => {
    setUser(formatUser(session?.user))
  }, [session])

  useEffect(() => {
    const handleStorage = async (event) => {
      if (event.key === "nextauth.message" && event.newValue?.includes("signIn")) {
        const newSession = await getSession()
        setUser(formatUser(newSession?.user))
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        const newSession = await getSession()
        setUser(formatUser(newSession?.user))
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])


  // Login function
  const login = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        return { success: false, error: 'Invalid Credentials!' }
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }

  // Register function
  const register = async ({ firstName, lastName, email, password }) => {
    try {
      // Call the register API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Registration failed: ${response.status}`;
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // fallback if not JSON
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        console.error("Registration API error:", response.status, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json()

      if (data.success) {
        return { success: true }
      } else {
        throw new Error(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    await signOut({ redirect: false })
    setUser(null)
    router.push("/")
  }

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      if (!session?.user) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Profile update API error:", response.status, errorText)
        throw new Error(`Profile update failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // NextAuth will update the session automatically on the next request
        return { success: true }
      } else {
        throw new Error(data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, error: error.message }
    }
  }

  // Check if user is authenticated
  const requireAuth = () => {
    if (loading) return false
    return !!session?.user
  }

  const value = {
    user,
    loading,
    status,
    login,
    logout,
    register,
    updateProfile,
    requireAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

