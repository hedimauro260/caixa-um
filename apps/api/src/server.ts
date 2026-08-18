import Fastify from "fastify";

export function buildServer() {
  return Fastify({
    logger: true,
  });
}
