import cron from "node-cron";
import { emailSendWorker } from "./workers/email.worker.js";
import { replySyncWorker } from "./workers/emailReplySync.worker.js";
import cors from "cors";
import sequelize from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { startCreditResetCron } from "./workers/creditReset.cron.js";
import leadRoutes from "./routes/lead.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import sequenceRoutes from "./routes/sequence.routes.js";
import { link } from "node:fs";
import linkedinScraperRoutes from "./routes/linkedinScraper.routes.js";
import csvImportRoutes from "./routes/csvImport.routes.js";
import express from "express";
import templateRoutes from "./routes/template.routes.js";
import icpProfileRoutes from "./routes/icpProfile.routes.js";
import emailRoutes from "./routes/emailRoutes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api", planRoutes);
app.use("/api/user/", webhookRoutes);
app.use("/api/generate/", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/sequences", sequenceRoutes);
app.use("/api/linkedin", linkedinScraperRoutes);
app.use("/api/import-csv", csvImportRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/icp-profiles", icpProfileRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/analytics', analyticsRoutes);


// startCreditResetCron();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true }); // Use only in Dev
    console.log("Database connected.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect:", error);
  }
};

import("./workers/csvImport.worker.js")
  .then(() => console.log("🛠️ CSV Import Worker started"))
  .catch((err) => console.error("❌ Failed to start CSV Import Worker", err));
import("./workers/email.worker.js")
  .then(() => console.log("📧 Email Worker started"))
  .catch((err) => console.error("❌ Failed to start Email Worker", err));

// Schedule emailSendWorker every minute
cron.schedule("* * * * *", emailSendWorker);

// Schedule replySyncWorker every 3 minutes
cron.schedule("*/3 * * * *", replySyncWorker);

startServer();
