import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

const TIERS = [
  { name: "Free", price: "$0", features: ["Live matches", "Basic match details"] },
  { name: "Pro", price: "$7.99/mo", features: ["Predictions", "Odds comparison", "Favorites"] },
  { name: "Elite", price: "$12.99/mo", features: ["Advanced insights", "Priority support", "Bet builder assistant"] },
];

export default function SubscriptionPage() {
  return (
    <main className="page-wrap">
      <PageHeader title="Subscription" subtitle="Choose a plan and proceed to checkout." />

      <section className="cards-grid">
        {TIERS.map((tier) => (
          <Card key={tier.name} className={tier.name === "Pro" ? "panel-accent" : undefined}>
            <h2>{tier.name}</h2>
            <p className="price">{tier.price}</p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button className="btn btn-primary" type="button">
              Continue to checkout
            </button>
          </Card>
        ))}
      </section>
    </main>
  );
}
