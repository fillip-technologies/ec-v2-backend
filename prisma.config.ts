import "dotenv/config";
import { defineConfig } from "prisma/config";

const host = process.env.DATABASE_HOST || "localhost";
const port = process.env.DATABASE_PORT || "3306";
const user = process.env.DATABASE_USER || "root";
const password = process.env.DATABASE_PASSWORD ? encodeURIComponent(process.env.DATABASE_PASSWORD) : "";
const database = process.env.DATABASE_NAME || "engineers_clinic";

const dbUrl =
  process.env.DATABASE_URL ||
  (password
    ? `mysql://${user}:${password}@${host}:${port}/${database}`
    : `mysql://${user}@${host}:${port}/${database}`);

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
