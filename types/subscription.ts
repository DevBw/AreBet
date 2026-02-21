export type SubscriptionTier = "free" | "pro" | "elite";

export interface TierConfig {
  name: SubscriptionTier;
  monthlyPrice: number;
}
