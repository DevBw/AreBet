"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listMatches } from "@/lib/services/matches";
import type { Match } from "@/types/match";

const FAVORITES_KEY = "arebet.favorites";

export default function FavoritesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      setFavorites(new Set(JSON.parse(saved) as number[]));
    }
  }, []);

  useEffect(() => {
    async function load() {
      const feed = await listMatches();
      setMatches(feed.matches);
    }
    load();
  }, []);

  const favoriteMatches = useMemo(() => matches.filter((match) => favorites.has(match.id)), [matches, favorites]);

  return (
    <main className="page-wrap">
      <PageHeader
        title="Favorites"
        subtitle="Your saved matches in one place."
        meta={[`Saved matches: ${favoriteMatches.length}`]}
        actions={
          <Link className="btn btn-muted" href="/dashboard">
            Back to dashboard
          </Link>
        }
      />

      <section className="cards-grid">
        {favoriteMatches.map((match) => (
          <Card key={match.id} className="match-card">
            <div className="match-row">
              <p className="match-league">
                {match.league} | {match.country}
              </p>
              <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                {match.status}
              </Badge>
            </div>
            <h2>
              {match.home.name} vs {match.away.name}
            </h2>
            <p className="muted">{match.prediction.advice}</p>
            <Link href={`/dashboard/match/${match.id}`} className="detail-link">
              View full match detail
            </Link>
          </Card>
        ))}
      </section>

      {!favoriteMatches.length ? (
        <Card className="empty-state">
          <h2>No favorites yet</h2>
          <p>Add favorites from the dashboard to see them here.</p>
        </Card>
      ) : null}
    </main>
  );
}
