import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: "development",
  databaseUrl: process.env.CONNECTION_STR,
  jwtSecret: process.env.JWT_SECRET,
};

export default config;