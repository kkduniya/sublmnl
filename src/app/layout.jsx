import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext"
import { NextAuthProvider } from "@/context/SesssionProvider"
import Script from "next/script"
import { Suspense } from "react"
import { Loader } from "lucide-react"

export const metadata = {
  title: "Sublmnl - Subliminal Audio Creation",
  description: "Create personalized subliminal audio tracks for self-improvement",
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Search Console */}
        <meta name="google-site-verification" content="NP4oeWdgwG4GjsigdOGo7xArBt-t5rNYZ_IlPHSccEA" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#000] text-gray-100`}>

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RCFCH7DW6D"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RCFCH7DW6D');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rxbm9874eo");
          `}
        </Script>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CustomThemeProvider>
            <NextAuthProvider>
              <AuthProvider>
                <Suspense fallback={
                  <div className="min-h-screen flex justify-center items-center">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                }>
                  <LayoutWrapper>{children}</LayoutWrapper>
                </Suspense>
                <Toaster />
              </AuthProvider>
            </NextAuthProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

