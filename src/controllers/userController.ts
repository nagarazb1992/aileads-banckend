


import type { Request, Response } from "express";
import * as userService from "../services/userService.js";
import User from "../models/User.js";
import { Plan } from "../models/Plan.js";
import { Organization } from "../models/Organization.js";
import { Membership } from "../models/membership.model.js";
import { CreditWallet, Subscription } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import { sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../services/email.service.js";
import { generateResetToken, generateVerificationToken } from "../services/token.service.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await userService.loginUser({ email, password });

    // Return the token and user info (excluding password)
    return res.status(200).json({
      message: "Login successful",
      token, // The client needs to save this (e.g., in localStorage)
      user: {
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        firstName: user.getDataValue("firstName"),
        lastName: user.getDataValue("lastName"),
      },
    });
  } catch (error: any) {
    // Security Best Practice:
    // Even if the user doesn't exist, we return 401 "Invalid Credentials"
    // to prevent attackers from guessing which emails exist in your DB.
    if (error.message === "Invalid Credentials") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Register controller
export async function register(req: any, res: any) {
  const { firstName, lastName, email, password, orgName } = req.body;

  // 1️⃣ Create user
  const hashed = await bcrypt.hash(password, 10);

  const verificationToken = generateVerificationToken();

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashed,
    emailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 3600000), // 1 hour from now
  });


  // 2️⃣ Create org
  const org = await Organization.create({
    name: orgName,
    user_id: user.getDataValue('id'),
  });


  // 3️⃣ Membership
  await Membership.create({
    user_id: user.getDataValue('id'),
    organization_id: org.getDataValue('id'),
    role: 'OWNER',
  });

  await sendVerificationEmail(email, verificationToken);

  // 🔥 4️⃣ SIGN JWT CORRECTLY
  const token = jwt.sign(
    {
      userId: user.getDataValue('id'),     // ✅ REQUIRED
      orgId: org.get,       // ✅ REQUIRED
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
}

// Get user details and subscription plan
export async function getUserDetails(req: any, res: any) {
    try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    console.log('getUserWithSubscription req.user:', req.user);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    decoded = jwt.verify(token, env.JWT_SECRET);
    
    const userId = req.user.userId;
    
    // Find user by email
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const emailId = User.findOne({ where: { id : userId } });

    // Find subscription (assuming one per user via organization)
    const membership = await Membership.findOne({ where: { user_id: userId } });
    let subscription = null;
    let plan = null;
    let credits = null;

    let orgName = null;
    if (membership) {
      const orgId = membership.getDataValue('organization_id');
      subscription = await Subscription.findOne({ where: { orgId: orgId }, order: [['createdAt', 'DESC']] });
      if (subscription) {
        plan = await Plan.findByPk(subscription.getDataValue('planId'));
      }
      // Fetch credits from CreditWallet
      const wallet = await CreditWallet.findOne({ where: { organization_id: orgId } });
      credits = wallet ? wallet.getDataValue('balance') : 0;
      // Fetch organization name
      const org = await Organization.findByPk(orgId);
      orgName = org ? org.getDataValue('name') : null;
    }

    res.json({
      user: {
        id: user.getDataValue('id'),
        email: user.getDataValue('email'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
        orgId: membership ? membership.getDataValue('organization_id') : null,
        orgName,
      },
      subscription,
      plan,
      credits,
    });
  } catch (error) {
    console.error('getUserWithSubscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify Email
export async function verifyEmail(req: any, res: any) {
  const { token } = req.query;

  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired verification link'
    });
  }

  user.setDataValue('emailVerified', true);
  user.setDataValue('emailVerificationToken', null);
  user.setDataValue('emailVerificationExpires', null);

  await user.save();

  // 🎉 Send welcome email AFTER verification
    await sendWelcomeEmail(
      user.getDataValue('email') ?? '',
      user.getDataValue('firstName') ?? ''
    );

  res.json({ message: 'Email verified successfully' });
}

// Resend Verification Email
export async function resendVerification(req: any, res: any) {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user || user.getDataValue('emailVerified')) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const token = generateVerificationToken();

  user.setDataValue('emailVerificationToken', token);
  user.setDataValue('emailVerificationExpires', new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ));

  await user.save();
  await sendVerificationEmail(email, token);

  res.json({ message: 'Verification email resent' });
}

// Forgot Password Request
export async function forgotPassword(req: any, res: any) {
  const { email } = req.body;

  try {
    console.log('Forgot password request for email:', email);

    const user = await User.findOne({ where: { email: email } });

    console.log('User found for forgot password:', user);

    // 🔐 Do NOT reveal if user exists
    if (!user) {
      return res.json({
        message: 'If the email exists, a reset link has been sent'
      });
    }

    const token = generateResetToken();

    console.log('Generated reset token:', token);

    user.setDataValue('resetPasswordToken', token);
    user.setDataValue('resetPasswordExpires', new Date(
      Date.now() + 30 * 60 * 1000 // 30 minutes
    ));

    await user.save();
    await sendResetPasswordEmail(email, token);

    res.json({
      message: 'If the email exists, a reset link has been sent'
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    // Always return generic message to avoid leaking info
    res.json({
      message: 'If the email exists, a reset link has been sent'
    });
  }
}

// Reset Password
export async function resetPassword(req: any, res: any) {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      resetPasswordToken: token
    }
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired reset link'
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.setDataValue('password', hashed);
  user.setDataValue('resetPasswordToken', null);
  user.setDataValue('resetPasswordExpires', null);

  await user.save();

  res.json({ message: 'Password reset successfully' });
}

// Update user profile
export const updateUserProfile = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.body.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only allow certain fields to be updated
    const allowedFields = ["firstName", "lastName", "email"];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        (user as any)[key] = req.body[key];
      }
    }
    await user.save();
    return res.json({ message: "Profile updated successfully", user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};

// Update organization details
export async function updateOrganization(req: any, res: any) {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const membership = await Membership.findOne({ where: { user_id: userId } });
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }
    const orgId = membership.getDataValue('organization_id');
    const org = await Organization.findByPk(orgId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }
    const allowedFields = ["name"];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        (org as any)[key] = req.body[key];
      }
    }
    await org.save();
    return res.json({ message: "Organization updated successfully", org });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update organization" });
  }
}

// Update user password
export async function updatePassword(req: any, res: any) {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "User ID, old password, and new password are required" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.setDataValue('password', hashed);
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update password" });
  }
}

