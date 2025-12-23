import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { validateEnv } from "./config/env";

// Validate environment variables before connecting to DB
validateEnv();

mongoose
  .connect(process.env.DB_HOST as string, {
    writeConcern: { w: "majority" },
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        "Database connection successful. Server running. Use our API on port: 3000"
      );
    });
  })
  .catch((error: Error) => {
    console.warn(error.message);
    process.exit(1);
  });
