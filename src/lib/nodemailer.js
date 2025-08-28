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
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}reset-password?token=${resetToken}`

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
        
        <p>Thanks,<br><strong>The Sublmnl Team</strong></p>

        <!-- ✅ Signature -->
        <div style="margin-top: 25px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 14px; color: #444;">
          <p style="margin: 0;"><strong>Sublmnl</strong></p>
          <p style="margin: 0;">📧 <a href="mailto:hello@sublmnl.ca" style="color:#4169E1; text-decoration:none;">hello@sublmnl.ca</a></p>
          <p style="margin: 0;">🌐 <a href="https://sublmnl.ca" style="color:#4169E1; text-decoration:none;">sublmnl.ca</a></p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  
      <div style="background-color: #4169E1; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px;">New Contact Form Submission</h2>
      </div>
      
      <div style="padding: 20px; color: #333333; line-height: 1.6;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #4169E1; text-decoration: none;">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>

        <p style="margin-top: 20px; font-weight: bold;">Message:</p>
        <div style="background-color: #f8f9fb; padding: 15px; border-left: 4px solid #4169E1; border-radius: 4px; margin: 15px 0; font-size: 15px; white-space: pre-line;">
          ${message.replace(/\n/g, "<br>")}
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #555;">You can reply directly to this email to respond to the sender.</p>
      </div>

      <div style="background-color: #f1f4f9; padding: 12px; text-align: center; font-size: 13px; color: #666;">
       Contact Form Alert · ${new Date().toLocaleDateString()}
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #4169E1; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Thank You for Contacting Us</h2>
        </div>

        <div style="padding: 20px; color: #333333; line-height: 1.6;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p>We've received your message and will get back to you as soon as possible, usually within 24 hours.</p>

          <p style="margin-top: 20px; font-weight: bold;">Your message details:</p>
          <p><strong>Subject:</strong> ${subject}</p>

          <div style="background-color: #f8f9fb; padding: 15px; border-left: 4px solid #4169E1; border-radius: 4px; margin: 15px 0; font-size: 15px; white-space: pre-line;">
            ${message.replace(/\n/g, "<br>")}
          </div>

          <p>If you have any additional information to add, please feel free to reply to this email.</p>

          <p style="margin-top: 25px;">Thanks,<br><strong>The Sublmnl Team</strong></p>

          <!-- ✅ Signature -->
          <div style="margin-top: 25px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 14px; color: #444;">
            <p style="margin: 0;"><strong>Sublmnl</strong></p>
            <p style="margin: 0;">📧 <a href="mailto:hello@sublmnl.ca" style="color:#4169E1;text-decoration:none;">hello@sublmnl.ca</a></p>
            <p style="margin: 0;">🌐 <a href="https://sublmnl.ca" style="color:#4169E1;text-decoration:none;">sublmnl.ca</a></p>
          </div>
        </div>

        <div style="background-color: #f1f4f9; padding: 15px; text-align: center; font-size: 13px; color: #666;">
          © ${new Date().getFullYear()} Sublmnl. All rights reserved.
        </div>
      </div>
    `
  }

  try {
    // Send email to admin
    await transporter.sendMail(adminMailOptions)

    // Send confirmation email to user
    await transporter.sendMail(userMailOptions)

    return { success: true }
  } catch (error) {
    console.error("Error sending contact form email:", error)
    return { success: false, error }
  }
}

