import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { User } from '../models/User.js';

// We define a specific type for the input to ensure safety
interface CreateUserDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const createUser = async (userData: CreateUserDTO): Promise<User> => {
  // 1. Check for duplicates
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // 2. Hash the password (Salt Rounds: 10 is standard)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // 3. Create User with hashed password
  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  return user;
};

interface LoginDTO {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: LoginDTO) => {
  // 1. Find user by email
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new Error('Invalid Credentials'); // Generic error for security
  }


  // 2. Compare the provided password with the stored hashed password
  const passwordHash = user.getDataValue('password');
  if (!passwordHash) {
    throw new Error('Invalid Credentials');
  }
  const isPasswordValid = await bcrypt.compare(password, passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid Credentials');
  }

  // 3. Generate JWT Token
  // In production, keep 'SECRET_KEY' in your .env file!
  const secretKey = process.env.JWT_SECRET || 'your-fallback-secret-key'; 

  const token = jwt.sign(
    { id: user.getDataValue('id'), email: user.getDataValue('email') },
    secretKey,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  return { user, token };
};