import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export class Lead extends Model {}

Lead.init(
  {
    
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "org_id",
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organization_id",
    },

    source: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "source",
    },

    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    emailStatus: DataTypes.ENUM("VALID", "INVALID", "UNKNOWN"),

    linkedinUrl: DataTypes.STRING,
    jobTitle: DataTypes.STRING,
    companyName: DataTypes.STRING,
    companyDomain: DataTypes.STRING,

    score: DataTypes.INTEGER,
    scoreReason: DataTypes.TEXT,

    priority: DataTypes.ENUM("HOT", "WARM", "COLD"),
    status: DataTypes.ENUM(
      "NEW",
      "QUALIFIED",
      "IN_CAMPAIGN",
      "RESPONDED",
      "FOLLOW_UP_LATER",
      "NOT_INTERESTED",
      "MEETING_BOOKED",
      "CLOSED",
      "WON"
    ),
    buying_intent_score: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      field: "buying_intent_score",
    },
    job_id: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      field: "job_id",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },

    enriched: { type: DataTypes.BOOLEAN, defaultValue: false },
    meta: DataTypes.JSONB,
  },
  { sequelize, tableName: "leads", underscored: true, timestamps: false }
);
