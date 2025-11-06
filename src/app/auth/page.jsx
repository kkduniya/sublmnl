"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, register, user, loading } = useAuth()
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  // useEffect(() => {
  //   if (!loading && user) {
  //     router.push("/dashboard/audios")
  //   }
  // }, [user, loading, router])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Handle login
        const result = await login(email, password)
        if (result.success) {
          if(returnTo === "create"){
            router.push("/pricing?returnTo=create");
          }else {
            router.push("/dashboard/audios")
          }
        } else {
          setError(result.error || "Login failed")
        }
      } else {
        // Handle registration
        if (!firstName.trim()) {
          setError("First name is required")
          setIsLoading(false)
          return
        }

        if (!email.trim()) {
          setError("Email is required")
          setIsLoading(false)
          return
        }

        if (!password.trim()) {
          setError("Password is required")
          setIsLoading(false)
          return
        }

        if (!isLogin && !acceptTerms) {
          setError("Please accept the terms and conditions")
          setIsLoading(false)
          return
        }

        // Call register function from AuthContext
        // If you don't have a register function in your AuthContext yet, you'll need to add it
        const result = await register({
          firstName,
          lastName,
          email,
          password,
        })
       
        if (result.success) {
          // Switch to login mode with success message
          setIsLogin(true)
          setError("")
          // You could also add a success message here
          toast({
            title: "Success!!",
            description: "Successfully Registration!!  Please login to continue.",
            variant: "success",
          });

        } else {
          setError(result.error || "Registration failed")
          toast({
            title: "Error",
            description: result.error || "Registration failed. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row rounded-xl overflow-hidden">
        <div className="w-full md:w-1/2 glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{isLogin ? "Sign In" : "Create Account"}</h2>
            <p className="mt-2 text-gray-400">
              {isLogin
                ? "Sign in to access your subliminal audio tracks"
                : "Create an account to start your manifestation journey"}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-md text-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field mt-1 focus:ring-2 focus:ring-[#c1fc75]/80"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field mt-1 focus:ring-2 focus:ring-[#c1fc75]/80"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1 focus:ring-2 focus:ring-[#c1fc75]/80"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1 focus:ring-2 focus:ring-[#c1fc75]/80"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pt-1 pr-3 flex items-center text-gray-400 hover:text-[#b1d239]/80"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 5.27L3.28 4L20 20.72L18.73 22l-3.08-3.08c-1.15.38-2.37.58-3.65.58c-5 0-9.27-3.11-11-7.5c.69-1.76 1.79-3.31 3.19-4.54zM12 9a3 3 0 0 1 3 3a3 3 0 0 1-.17 1L11 9.17A3 3 0 0 1 12 9m0-4.5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-4 5.19l-1.42-1.43A9.86 9.86 0 0 0 20.82 12A9.82 9.82 0 0 0 12 6.5c-1.09 0-2.16.18-3.16.5L7.3 5.47c1.44-.62 3.03-.97 4.7-.97M3.18 12A9.82 9.82 0 0 0 12 17.5c.69 0 1.37-.07 2-.21L11.72 15A3.064 3.064 0 0 1 9 12.28L5.6 8.87c-.99.85-1.82 1.91-2.42 3.13"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/></svg>
                  )}
                </button>
              </div>
              {
                !isLogin && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={acceptTerms}
                        onCheckedChange={setAcceptTerms}
                        required
                        className="border-[#b1d239]/80 data-[state=checked]:bg-[#b1d239]/80 data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        I accept the{" "}
                        <Link href="/terms" target="_blank" className="text-[#b1d239]/80 hover:text-[#b1d239] transition-colors duration-200">
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>
                  </div>
                )
              }

              <div className="flex items-center justify-end py-2">
            <Link href="/forgot-password" className="text-sm text-[#b1d239]/80 hover:underline">
              Forgot password?
            </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3  font-semibold rounded-xl shadow-md hover:shadow-lg bg-gradient-to-r from-[#e4ffa8]/70 to-[#b1d239]/70 text-black w-full flex justify-center items-center hover:font-bold"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                ) : null}
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#b1d239]/80 hover:text-[#b1d239]/60">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

        </div>

        <div className="md:block mt-8 md:mt-0 md:w-1/2 bg-[#b1d239]/10 p-8 flex flex-col justify-center rounded-xl mx-3">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Transform Your Life with Subliminal Affirmations</h3>
            <p className="text-gray-300">
              Harness the power of your subconscious mind to manifest your dreams and achieve your goals.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#b1d239]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#b1d239]/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium">AI-Generated Affirmations</h4>
                <p className="text-gray-400">Personalized to your specific goals</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#b1d239]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#b1d239]/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium">Premium Music Library</h4>
                <p className="text-gray-400">50+ tracks designed for different goals</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#c1fc75]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#c1fc75]/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium">Instant Downloads</h4>
                <p className="text-gray-400">Listen anywhere, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

