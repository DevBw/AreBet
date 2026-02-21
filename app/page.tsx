import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Basic live scores, match information, and league standings.",
    features: ["Basic live scores", "Match information", "League standings"],
  },
  {
    name: "Pro",
    price: "$7.99/mo",
    description: "AI predictions and deeper betting intelligence.",
    features: ["AI predictions", "Odds comparison", "Deep match statistics", "Favorites", "Live events", "Ad-free"],
  },
  {
    name: "Elite",
    price: "$12.99/mo",
    description: "Advanced engine for serious bettors.",
    features: ["Everything in Pro", "Advanced prediction engine", "AI insights", "Bet builder assistant", "Push notifications", "Priority support"],
  },
];

export default function HomePage() {
  return (
    <main className="ab-shell">
      <header className="ab-header">
        <h1>AreBet</h1>
        <p>Smart Betting. Simple Insights.</p>
      </header>

      <section className="ab-grid" aria-label="Membership tiers">
        {tiers.map((tier) => (
          <article key={tier.name} className="ab-card">
            <h2>{tier.name}</h2>
            <p className="ab-price">{tier.price}</p>
            <p className="ab-description">{tier.description}</p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="ab-links" aria-label="Application sections">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/auth/login">Login</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/api/health">API Health</Link>
      </section>
    </main>
  );
}
