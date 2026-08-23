import { checkDatabaseConnection } from "@caixa-1/database";
import { config } from "@caixa-1/config";
import { buildServer } from "./server.js";

const start = async () => {
  const server = await buildServer();
  try {
    const result = await checkDatabaseConnection();
    server.log.info({ result }, "Database connection verified");

    await server.listen({
      port: config.server.port,
      host: "0.0.0.0",
    });

    const shutdown = async (signal: string) => {
      server.log.info({ signal }, "Shutting down gracefully...");
      await server.close();
      process.exit(0);
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

void start();
