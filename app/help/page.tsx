import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

const FAQ = [
  {
    q: "How often does match data update?",
    a: "The interface refreshes regularly and shows the last update timestamp on each major page.",
  },
  {
    q: "Can I save matches?",
    a: "Yes. Use Favorites on the dashboard and view them in the Favorites page.",
  },
  {
    q: "What does confidence mean?",
    a: "Confidence is a model signal to help rank opportunities, not a guaranteed result.",
  },
];

export default function HelpPage() {
  return (
    <main className="page-wrap">
      <PageHeader title="Help / FAQ" subtitle="Answers to common questions and how to use the platform." />

      <section className="cards-grid">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <h2>{item.q}</h2>
            <p className="muted">{item.a}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
