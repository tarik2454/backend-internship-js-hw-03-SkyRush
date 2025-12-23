const requiredEnvVars = ["DB_HOST", "JWT_SECRET", "PORT"];
const productionOnlyVars = ["ALLOWED_ORIGINS"];

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    const missingProd = productionOnlyVars.filter((key) => !process.env[key]);
    missing.push(...missingProd);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
