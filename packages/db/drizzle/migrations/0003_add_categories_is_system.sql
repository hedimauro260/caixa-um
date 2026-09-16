--> statement-breakpoint
-- Corrige drift do schema: categories.is_system foi adicionado ao
-- schema (categorias de sistema, ex.: "Saldo inicial") mas o 0000
-- foi gerado antes da coluna existir.
ALTER TABLE "categories" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;