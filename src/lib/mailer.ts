import React from "react";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { render } from "@react-email/render";
import BookingConfirmation, { BookingConfirmationProps } from "../emails/BookingConfirmation.js";

// Singleton definitions to avoid reinstantiation per request
let transporter: any = null;
let resendClient: Resend | null = null;

function getNodemailerTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    
    if (user && pass) {
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user, pass },
      });
    }
  }
  return transporter;
}

function getResendClient(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is required in production");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

export async function sendConfirmationEmail(data: BookingConfirmationProps): Promise<void> {
  try {
    const { email, name } = data;
    const isProd = process.env.NODE_ENV === "production";

    // 1. Render template to HTML string using @react-email/render
    const html = await render(React.createElement(BookingConfirmation, data));

    // 2. Select strategy based on NODE_ENV
    if (!isProd) {
      // === Development Mode (Nodemailer + Gmail SMTP) ===
      const gmailUser = process.env.GMAIL_USER || "";
      const gmailPass = process.env.GMAIL_APP_PASSWORD || "";

      if (!gmailUser || !gmailPass) {
        console.warn(
          `[Mailer:dev] WARNING: Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment. Skipping email dispatch to ${email}.`
        );
        return;
      }

      const mailTransporter = getNodemailerTransporter();
      if (!mailTransporter) {
        console.warn("[Mailer:dev] WARNING: Failed to create nodemailer SMTP transporter. Skipping email.");
        return;
      }

      await mailTransporter.sendMail({
        from: `"BigApple Lens" <${gmailUser}>`,
        to: email,
        subject: `Your NYC Shoot Confirmation - Booking ${data.bookingId}`,
        html,
      });

      console.log(`[Mailer:dev] Email sent to ${email} via Nodemailer`);
    } else {
      // === Production Mode (Resend API) ===
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is missing in production environment");
      }

      const client = getResendClient();
      
      const response = await client.emails.send({
        from: "BigApple Lens <confirm@yourdomain.com>",
        to: [email],
        subject: `Your NYC Shoot Confirmation - Booking ${data.bookingId}`,
        html,
      });

      if (response.error) {
        console.error("[Mailer:prod] Resend API encountered an error:", response.error);
        throw new Error(`Resend Error: ${response.error.message}`);
      }

      console.log(`[Mailer:prod] Email sent to ${email} via Resend. Email ID: ${response.data?.id}`);
    }
  } catch (error: any) {
    // Robust error isolation — email dispatch failure must not block webhook success / database state
    console.error(`[Mailer:error] Failed to dispatch booking confirmation email to ${data.email}:`, error.message || error);
  }
}
