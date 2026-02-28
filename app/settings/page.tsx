"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/lib/hooks/use-preferences";

export default function SettingsPage() {
  const { preferences, updatePreferences, loading, error } = usePreferences();

  return (
    <main className="page-wrap">
      <PageHeader
        title="Settings"
        subtitle="Manage preferences, notifications, and profile behavior."
      />

      {loading ? (
        <section className="cards-grid">
          <Card title="Preferences">
            <Skeleton className="skeleton-line w-full" />
            <Skeleton className="skeleton-line w-full" />
            <Skeleton className="skeleton-line w-full" />
          </Card>
        </section>
      ) : (
        <section className="cards-grid">
          <Card title="Notifications">
            <p className="muted">Match alerts: Enabled</p>
            <p className="muted">Price movement alerts: Enabled</p>
          </Card>

          <Card title="Display">
            <SelectField
              label="Density"
              value={preferences.density}
              onChange={(e) => updatePreferences({ density: e.target.value })}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Comfortable", value: "comfortable" },
              ]}
            />
            <SelectField
              label="Odds format"
              value={preferences.odds_format}
              onChange={(e) => updatePreferences({ odds_format: e.target.value })}
              options={[
                { label: "Decimal (1.85)", value: "decimal" },
                { label: "Fractional (17/20)", value: "fractional" },
                { label: "American (-118)", value: "american" },
              ]}
            />
          </Card>

          <Card title="Dashboard defaults">
            <SelectField
              label="Default sort"
              value={preferences.default_sort}
              onChange={(e) => updatePreferences({ default_sort: e.target.value })}
              options={[
                { label: "Kickoff time", value: "kickoff" },
                { label: "Confidence", value: "confidence" },
                { label: "Odds", value: "odds" },
                { label: "League", value: "league" },
              ]}
            />
            <SelectField
              label="Default status filter"
              value={preferences.default_filter_status}
              onChange={(e) => updatePreferences({ default_filter_status: e.target.value })}
              options={[
                { label: "Live", value: "live" },
                { label: "Upcoming", value: "upcoming" },
                { label: "All", value: "all" },
              ]}
            />
          </Card>

          <Card title="Behavior">
            <label className="field">
              <span className="field-label">Show favorites first</span>
              <input
                type="checkbox"
                checked={preferences.show_favorites_first}
                onChange={(e) =>
                  updatePreferences({ show_favorites_first: e.target.checked })
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Hide finished matches</span>
              <input
                type="checkbox"
                checked={preferences.hide_finished}
                onChange={(e) =>
                  updatePreferences({ hide_finished: e.target.checked })
                }
              />
            </label>
          </Card>
        </section>
      )}

      {error ? <p className="muted mt-4">Error: {error}</p> : null}
    </main>
  );
}
