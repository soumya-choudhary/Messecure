import { resendClient, sender } from "../lib/email.js";
import { createEmailTemplate, createOTPEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to Messecure!",
    html: createEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};

export const sendOTPEmail = async (email, otp, name = null) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: "soumyach7177@gmail.com",
    subject: "Verify Your Email - Messecure",
    html: createOTPEmailTemplate(otp, name),
  });

  if (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }

  console.log("OTP Email sent successfully", data);
};
