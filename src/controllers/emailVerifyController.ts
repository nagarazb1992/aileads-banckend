import User from "../models/User.js";
import { sendWelcomeEmail } from "../services/email.service.js";


export async function verifyEmail(req: any, res: any) {
  const { token } = req.query;

  console.log("Verifying token:", token);

  const user = await User.findOne({
    where: {
      emailVerificationToken: token
    }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.setDataValue("emailVerified", true);
  user.setDataValue("emailVerificationToken", null);
  user.setDataValue("emailVerificationExpires", null);
  await user.save();

  // 🎉 Send welcome email AFTER verification
  await sendWelcomeEmail(user.getDataValue("email"), user.getDataValue("firstName") || '');

  res.json({ message: 'Email verified successfully' });
}
