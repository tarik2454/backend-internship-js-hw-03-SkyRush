import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { validateEnv } from "./config/env";

const PORT = process.env.PORT || 3000;

validateEnv();

mongoose
  .connect(process.env.DB_HOST as string, {
    writeConcern: { w: "majority" },
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful. Server running on port: ${PORT}`
      );
    });
  })
  .catch((error: Error) => {
    console.warn(error.message);
    process.exit(1);
  });
