import { checkDatabaseConnection } from "@caixa-1/database";
import { buildServer } from "./server";

const server = buildServer();

const start = async () => {
  try {
    const result = await checkDatabaseConnection();

    server.log.info({ result }, "Database connection verified");

    await server.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

void start();
