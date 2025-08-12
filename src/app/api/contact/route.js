import { sendContactFormEmail } from "@/lib/nodemailer"

export async function POST(request) {
  try {
    const formData = await request.json()

    // Basic validation
    const { name, email, subject, message } = formData

    if (!name || !email || !subject || !message) {
      return Response.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    // Send the email
    const result = await sendContactFormEmail(formData)

    if (result.success) {
      return Response.json({ success: true, message: "Your message has been sent successfully" }, { status: 200 })
    } else {
      throw new Error("Failed to send email")
    }
  } catch (error) {
    console.error("Contact form submission error:", error)

    return Response.json(
      {
        success: false,
        message: "There was a problem sending your message. Please try again later.",
      },
      { status: 500 },
    )
  }
}
