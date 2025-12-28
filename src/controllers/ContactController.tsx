
import type { Request, Response } from "express";
import { ContactMessage } from "../models/ContactMessage.js";
import { sendEmail } from "../services/email.service.js";

export const submitContactForm = async (req: any, res: any) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // 1️⃣ Save to DB
    const contact = await ContactMessage.create({
      name,
      email,
      message,
      ip_address: req.ip,
    });

    // 2️⃣ Send notification email using existing sendEmail service
    await sendEmail(
      process.env.CONTACT_RECEIVER_EMAIL!,
      "📩 New Contact Us Message",
      `<div>
        <strong>Name:</strong> ${name}<br/>
        <strong>Email:</strong> ${email}<br/>
        <strong>Message:</strong><br/>
        <pre>${message}</pre>
      </div>`
    );

    return res.status(201).json({
      success: true,
      message: "Thanks for contacting us. We'll get back to you shortly.",
      id: contact.id,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
