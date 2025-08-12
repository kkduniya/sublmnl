import nodemailer from "nodemailer"

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to another service if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // This should be an app password for Gmail
  },
})

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"Sublmnl" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Sublmnl Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4169E1;">Reset Your Password</h2>
        <p>You requested a password reset for your Sublmnl account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4169E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>Thanks,<br>The Sublmnl Team</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

export async function sendContactFormEmail(formData) {
  const { name, email, subject, message } = formData

  // Email to the site admin
  const adminMailOptions = {
    from: `"Sublmnl Contact Form" <${process.env.EMAIL_USER}>`,
    to: `hello@sublmnl.ca`, // Send to your admin email
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4169E1;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
          ${message.replace(/\n/g, "<br>")}
        </div>
        <p>You can reply directly to this email to respond to the sender.</p>
      </div>
    `,
    replyTo: email, // Allow direct reply to the sender
  }

  // Confirmation email to the user
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Thank you for contacting Sublmnl - ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4169E1;">Thank You for Contacting Us</h2>
        <p>Hello ${name},</p>
        <p>We've received your message and will get back to you as soon as possible, usually within 24 hours.</p>
        <p><strong>Your message details:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
          ${message.replace(/\n/g, "<br>")}
        </div>
        <p>If you have any additional information to add, please feel free to reply to this email.</p>
        <p>Thanks,<br>The Sublmnl Team</p>
      </div>
    `,
  }

  try {
    // Send email to admin
    await transporter.sendMail(adminMailOptions)

    // Send confirmation email to user
    // await transporter.sendMail(userMailOptions)

    return { success: true }
  } catch (error) {
    console.error("Error sending contact form email:", error)
    return { success: false, error }
  }
}

