"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useMatchFeed } from "@/lib/hooks/use-match-feed";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, loading: favsLoading } = useFavorites();
  const { matches, loading: feedLoading } = useMatchFeed();

  const loading = favsLoading || feedLoading;

  // Match-type favorites cross-referenced with feed
  const favoriteMatches = useMemo(() => {
    const favMatchIds = new Set(
      favorites
        .filter((f) => f.entity_type === "match")
        .map((f) => Number(f.entity_id))
    );
    return matches.filter((m) => favMatchIds.has(m.id));
  }, [matches, favorites]);

  // Non-match favorites (teams, leagues)
  const otherFavorites = useMemo(
    () => favorites.filter((f) => f.entity_type !== "match"),
    [favorites]
  );

  return (
    <main className="page-wrap">
      <PageHeader
        title="Favorites"
        subtitle="Your saved matches, teams, and leagues in one place."
        meta={[`Total saved: ${favorites.length}`]}
        actions={
          <Link className="btn btn-muted" href="/">
            Back to home
          </Link>
        }
      />

      {loading ? (
        <section className="cards-grid" aria-label="Loading favorites">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="match-card">
              <Skeleton className="skeleton-line w-40" />
              <Skeleton className="skeleton-line w-full" />
              <Skeleton className="skeleton-line w-28" />
            </Card>
          ))}
        </section>
      ) : null}

      {!loading && favoriteMatches.length > 0 ? (
        <section className="cards-grid" aria-label="Favorite matches">
          {favoriteMatches.map((match) => (
            <Card key={match.id} className="match-card">
              <div className="match-row">
                <p className="match-league">
                  {match.league} | {match.country}
                </p>
                <Button
                  type="button"
                  variant="muted"
                  className="favorite-btn is-favorite"
                  onClick={() =>
                    toggleFavorite({
                      entityType: "match",
                      entityId: String(match.id),
                      label: `${match.home.name} vs ${match.away.name}`,
                    })
                  }
                  aria-pressed={true}
                  title="Remove favorite"
                >
                  Favored
                </Button>
              </div>
              <h2>
                {match.home.name} vs {match.away.name}
              </h2>
              <div className="match-row">
                <Badge tone={match.status.toLowerCase() as "live" | "upcoming" | "finished"}>
                  {match.status}
                </Badge>
              </div>
              <p className="muted">{match.prediction.advice}</p>
              <Link href={`/match/${match.id}`} className="detail-link">
                View full match detail
              </Link>
            </Card>
          ))}
        </section>
      ) : null}

      {!loading && otherFavorites.length > 0 ? (
        <section className="cards-grid" aria-label="Other favorites">
          {otherFavorites.map((fav) => (
            <Card key={`${fav.entity_type}:${fav.entity_id}`} className="match-card">
              <div className="match-row">
                <Badge tone="neutral">{fav.entity_type}</Badge>
                <Button
                  type="button"
                  variant="muted"
                  className="favorite-btn is-favorite"
                  onClick={() =>
                    toggleFavorite({
                      entityType: fav.entity_type,
                      entityId: fav.entity_id,
                      label: fav.label,
                    })
                  }
                  title="Remove favorite"
                >
                  Favored
                </Button>
              </div>
              <h2>{fav.label}</h2>
            </Card>
          ))}
        </section>
      ) : null}

      {!loading && !favorites.length ? (
        <EmptyState
          title="No favorites yet"
          description="Add favorites from the home page to see them here."
          action={{ label: "Browse matches", href: "/" }}
        />
      ) : null}
    </main>
  );
}
