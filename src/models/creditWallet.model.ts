import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export class CreditWallet extends Model {}

CreditWallet.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    balance: { type: DataTypes.INTEGER, defaultValue: 0 },
    lifetimeUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "lifetime_used",
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organization_id",
    },
  },
  {
    sequelize,
    tableName: "credit_wallets",
    timestamps: false,
    underscored: true,
  }
); // 🔥 REQUIRED});
