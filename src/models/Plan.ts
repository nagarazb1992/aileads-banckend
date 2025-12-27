import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export class Plan extends Model {}

Plan.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    priceMonthlyUsd: {
      type: DataTypes.INTEGER,
      field: "price_monthly_usd", // 👈 map to DB column
    },

    monthlyLeadLimit: { type: DataTypes.INTEGER, field: "monthly_lead_limit" },
    dailyAutoDiscoveryLimit: {
      type: DataTypes.INTEGER,
      field: "daily_auto_discovery_limit",
    },
    seatLimit: { type: DataTypes.INTEGER, field: "seat_limit" },

    monthlyCostBudgetUsd: {
      type: DataTypes.DECIMAL(10, 2),
      field: "monthly_cost_budget_usd",
    }, // 🔥 cost control
    features: DataTypes.JSONB,
  },
  {
    sequelize,
    tableName: "plans",
    timestamps: false, // creates createdAt & updatedAt
    underscored: true,
  }
);
