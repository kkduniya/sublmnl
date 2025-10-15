"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const { user, updateProfile, requireAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })
  const router = useRouter()
  const [showPasswordOptions, setShowPasswordOptions] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  useEffect(() => {
    if (!requireAuth()) return

    if (user) {
      // setFormData({
      //   firstName: user.firstName || "",
      //   lastName: user.lastName || "",
      //   email: user.email || "",
      // })
      fetchUserProfile()
    }
  }, [user, requireAuth])

    const fetchUserProfile = async () => {
      try {

        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.id}`,
          },
        })

        const data = await response.json()
        setFormData((prev) => ({
            ...prev,
            firstName: data?.user?.firstName || "",
            lastName: data?.user?.lastName || "",
            email: data?.user?.email || "",
          }))
        

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user profile")
        }

      } catch (error) {
        console.error("Error fetching user profile:", error.message)
        return null
      }
    }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        setIsEditing(false)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

    // Update the handlePasswordUpdate function
 const handlePasswordUpdate = async (e) => {
  e.preventDefault();

  if (formData.newPassword !== formData.confirmPassword) {
    setPasswordMessage({ type: "error", text: "New passwords do not match" });
    return;
  }

  setIsPasswordLoading(true);
  setPasswordMessage({ type: "", text: "" });

  try {
    const response = await fetch("/api/user/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.id}`,
      },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update password");
    }

    setPasswordMessage({ type: "success", text: data.message });
    setShowPasswordOptions(false)

    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  } catch (error) {
    console.error("Password update error:", error);
    setPasswordMessage({ type: "error", text: `An error occurred: ${error.message}` });
  } finally {
    setIsPasswordLoading(false);
  }
};

  if (!user) {
    return null // This will be handled by requireAuth redirect
  }

  return (
    <div className="sm:min-h-screen py-12 px-6 md:px-12 flex justify-center items-center">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit Profile
            </button>
          )}
        </div>

        {message.text && (
          <div
            className={`p-4 mb-6 rounded-md ${message.type === "success"
              ? "bg-green-900/30 border border-green-500 text-green-200"
              : "bg-red-900/30 border border-red-500 text-red-200"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="glass-card p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">First Name</h3>
                  <p className="text-lg">{formData?.firstName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Last Name</h3>
                  <p className="text-lg">{formData?.lastName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Email Address</h3>
                <p className="text-lg">{formData?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Subscription Plan</h3>
                <p className="text-lg capitalize">{user.subscription.toLowerCase() === "premium" ? "Sublmnl Membership" : user.subscription || "Free"}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
          <div className="glass-card p-6 space-y-6">
            {passwordMessage.text && (
          <div
            className={`p-4 mb-6 rounded-md ${passwordMessage.type === "success"
              ? "bg-green-900/30 border border-green-500 text-green-200"
              : "bg-red-900/30 border border-red-500 text-red-200"
              }`}
          >
            {passwordMessage.text}
          </div>
        )}
            {
              showPasswordOptions ?
                <div>
                  <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* <button
                type="submit"
                className="bg-secondary rounded-md py-3 text-sm px-3 hover:bg-accent"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? "Updating..." : "Change Password"}
              </button> */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordOptions(false)}
                  className="btn-secondary"
                  disabled={isPasswordLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isPasswordLoading}>
                  {isPasswordLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
                </div>
                :
                <div>
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <button className="btn-secondary" onClick={() => setShowPasswordOptions(true)}>Change Password</button>
                </div>
            }

            <div>
              <h3 className="text-lg font-medium mb-2">Subscription Management</h3>
              <button className="btn-secondary"
                onClick={() => [
                  router.push("/dashboard/subscriptions")
                ]}
              >
                Manage Subscription</button>
            </div>

            {/* <div>
              <h3 className="text-lg font-medium mb-2 text-red-400">Danger Zone</h3>
              <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Delete Account
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

