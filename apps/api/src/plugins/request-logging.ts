import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function setupRequestLogging(app: FastifyInstance): Promise<void> {
  app.addHook("onResponse", (request: FastifyRequest, reply: FastifyReply, done) => {
    const { method, url } = request;
    const { statusCode } = reply;
    const elapsed = reply.elapsedTime;

    const logData = {
      method,
      url,
      statusCode,
      elapsed: `${elapsed.toFixed(0)}ms`,
      requestId: request.id,
    };

    if (statusCode >= 500) {
      request.log.error(logData, "request completed with server error");
    } else if (statusCode >= 400) {
      request.log.warn(logData, "request completed with client error");
    } else {
      request.log.info(logData, "request completed");
    }

    done();
  });
}
