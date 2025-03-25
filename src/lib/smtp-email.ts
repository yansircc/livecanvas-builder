import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.useplunk.com",
      port: 587,
      secure: false,
      auth: {
        user: "plunk",
        pass: "sk_c797efab9fdedc238a89ee477d7e14e9a094f253b725911f",
      },
    });

    // Verify SMTP connection configuration
    await transporter.verify();

    const info = await transporter.sendMail({
      from: '"Plunk Mailer" <plunk@xunpanziyou.com>',
      to,
      subject,
      text,
    });

    console.log("Message sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw error;
  }
}

// Test the email sending
sendEmail("markyan@foxmail.com", "Test Email", "This is a test email").catch(
  (error) => {
    console.error("Email sending failed:", error);
    process.exit(1);
  }
);
