export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}
