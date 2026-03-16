"use client";

import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type ProfilePanelProps = {
  user: User;
  onUpdated?: (name: string) => void;
};

function formatMemberSince(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "Unknown";
  }
}

export function ProfilePanel({ user, onUpdated }: ProfilePanelProps) {
  const displayName: string =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "User";

  const [editing, setEditing]       = useState(false);
  const [nameInput, setNameInput]   = useState(displayName);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [savedName, setSavedName]   = useState(displayName);

  const saveName = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === savedName) { setEditing(false); return; }

    setSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { display_name: trimmed },
      });
      if (error) throw error;
      setSavedName(trimmed);
      setEditing(false);
      onUpdated?.(trimmed);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [nameInput, savedName, onUpdated]);

  const seed = savedName !== user.email ? savedName : (user.email ?? "U");

  return (
    <div className="profile-panel">
      <div className="profile-avatar-row">
        <Avatar seed={seed} size="xl" />
        <div className="profile-identity">
          {editing ? (
            <div className="profile-name-edit">
              <input
                type="text"
                className="profile-name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") { setEditing(false); setNameInput(savedName); }
                }}
                autoFocus
                maxLength={40}
                aria-label="Display name"
              />
              <div className="profile-name-actions">
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={saveName}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => { setEditing(false); setNameInput(savedName); }}
                >
                  Cancel
                </button>
              </div>
              {saveError && <p className="profile-save-error">{saveError}</p>}
            </div>
          ) : (
            <div className="profile-name-row">
              <h2 className="profile-name">{savedName}</h2>
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setEditing(true)}
                title="Edit display name"
              >
                ✎
              </button>
            </div>
          )}
          <p className="profile-email">{user.email}</p>
          <p className="profile-since">
            Member since {formatMemberSince(user.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
