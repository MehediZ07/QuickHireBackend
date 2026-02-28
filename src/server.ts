import express from "express";
import config from "./config";
import { initDB } from "./config/database";
import authRoutes from "./modules/auth/auth.routes";
import jobRoutes from "./modules/jobs/jobs.routes";
import applicationRoutes from "./modules/applications/applications.routes";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

initDB().then(() => {
  console.log('Database initialized');
}).catch(console.error);

app.get("/", (req, res) => {
  res.json({
    message: "QuickHire API is running",
    version: "1.0.0"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(config.port, () => {
  console.log(`QuickHire API running on port ${config.port}`);
});