// src/services/whatsapp.service.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsappMessage({
  to,
  message
}: {
  to: string;
  message: string;
}) {
  return client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body: message
  });
}
