import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import sequelize from "../config/database.js";

// 1. Define attributes interface
interface UserAttributes {
  id: string;
  email: string;
  password?: string; // Optional because we might return user without password
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define creation attributes (ID is optional as it's auto-generated)
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

// 3. Define the Class with generics
export class User extends Model<UserAttributes, UserCreationAttributes> {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: { msg: "Must be a valid email address" },
        notEmpty: { msg: "Email cannot be empty" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "email_verified",
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "email_verification_token",
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "email_verification_expires",
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "reset_password_token",
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reset_password_expires",
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);
export default User;
