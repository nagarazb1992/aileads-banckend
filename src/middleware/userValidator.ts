// src/middleware/userValidator.ts
import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateUser = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('firstName is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // Middleware to catch errors
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];