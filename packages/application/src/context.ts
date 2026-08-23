import type { EconomicDate } from "@caixa-1/domain";

export interface ApplicationContext {
  readonly userId: string;
  readonly today: EconomicDate;
}
