import type { FastifyInstance } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { config } from "@caixa-1/config";
import { DrizzleUserRepository } from "@caixa-1/database";
import { createUser, createUserId } from "@caixa-1/domain";
import type { ApplicationContext } from "@caixa-1/application";

const clerkClient = createClerkClient({
  secretKey: config.clerk.secretKey,
});

const userRepo = new DrizzleUserRepository();

declare module "fastify" {
  interface FastifyRequest {
    context: ApplicationContext;
  }
}

export async function setupAuth(app: FastifyInstance): Promise<void> {
  app.decorateRequest("context", undefined as unknown as ApplicationContext);

  app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health") return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: "Token de autenticação não fornecido",
        },
      });
    }

    const token = authHeader.slice(7);

    try {
      const verified = await verifyToken(token, {
        secretKey: config.clerk.secretKey,
      });
      const clerkId = verified.sub;

      let user = await userRepo.findByClerkId(clerkId);

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress;

        if (!email) {
          return reply.status(400).send({
            error: {
              code: "NO_EMAIL",
              message: "Usuário Clerk não possui email principal",
            },
          });
        }

        user = createUser({
          id: createUserId(crypto.randomUUID()),
          clerkId,
          email,
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        });

        await userRepo.save(user);
      }

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      request.context = {
        userId: user.id,
        today: `${yyyy}-${mm}-${dd}` as ApplicationContext["today"],
      };
    } catch {
      return reply.status(401).send({
        error: {
          code: "INVALID_TOKEN",
          message: "Token de autenticação inválido ou expirado",
        },
      });
    }
  });
}
