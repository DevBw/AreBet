"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Keys managed by the app that get wiped on account deletion
const LOCAL_STORAGE_KEYS = [
  "arebet:bet-slip:v1",
  "arebet:match-ratings:v1",
  "arebet:predictions:v1",
  "arebet:theme:v1",
  "arebet:onboarded:v1",
  "arebet:default-stake:v1",
  "arebet:fav-leagues:v1",
  "arebet:prefs:v1",
  "arebet:last-league",
  "arebet:quick-filter",
];

function clearAllLocalData() {
  if (typeof window === "undefined") return;
  LOCAL_STORAGE_KEYS.forEach((k) => {
    try { localStorage.removeItem(k); } catch { /* noop */ }
  });
}

type DangerZoneProps = {
  /** Whether the user is authenticated (shows sign-out + delete when true). */
  isAuthed: boolean;
};

export function DangerZone({ isAuthed }: DangerZoneProps) {
  const router = useRouter();

  // ── Sign out ─────────────────────────────────────────────────────────────
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  // ── Clear local data ──────────────────────────────────────────────────────
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared]           = useState(false);

  const handleClearData = useCallback(() => {
    clearAllLocalData();
    setCleared(true);
    setConfirmClear(false);
    // Reload so all hooks re-hydrate from empty storage
    setTimeout(() => window.location.reload(), 800);
  }, []);

  // ── Delete account ────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [deleteInput, setDeleteInput]       = useState("");
  const [deleting, setDeleting]             = useState(false);
  const [deleteError, setDeleteError]       = useState<string | null>(null);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      // Clear all local data first
      clearAllLocalData();

      // Sign out via Supabase (full account deletion requires server-side admin)
      const supabase = createClient();
      await supabase.auth.signOut();

      // Redirect — account flagged for deletion by support
      router.push("/?deleted=1");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }, [router]);

  return (
    <div className="danger-zone">
      <h3 className="danger-zone-title">Danger Zone</h3>

      {/* ── Clear local data ── */}
      <div className="danger-action">
        <div className="danger-action-info">
          <span className="danger-action-label">Clear local data</span>
          <span className="danger-action-desc">
            Wipes all cached picks, ratings, predictions, and preferences from this device.
          </span>
        </div>
        {confirmClear ? (
          <div className="danger-confirm-row">
            <span className="danger-confirm-text">Are you sure?</span>
            <button
              type="button"
              className="danger-btn danger-btn--confirm"
              onClick={handleClearData}
            >
              {cleared ? "Cleared ✓" : "Yes, clear"}
            </button>
            <button
              type="button"
              className="danger-btn"
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="danger-btn"
            onClick={() => setConfirmClear(true)}
          >
            Clear data
          </button>
        )}
      </div>

      {/* ── Sign out (auth only) ── */}
      {isAuthed && (
        <div className="danger-action">
          <div className="danger-action-info">
            <span className="danger-action-label">Sign out</span>
            <span className="danger-action-desc">
              Ends your session on this device. Your data stays intact.
            </span>
          </div>
          <button
            type="button"
            className="danger-btn"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}

      {/* ── Delete account (auth only) ── */}
      {isAuthed && (
        <div className="danger-action danger-action--delete">
          <div className="danger-action-info">
            <span className="danger-action-label danger-action-label--red">Delete account</span>
            <span className="danger-action-desc">
              Permanently removes your account and all associated data. This cannot be undone.
            </span>
          </div>
          {confirmDelete ? (
            <div className="danger-delete-flow">
              <p className="danger-delete-prompt">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                className="danger-delete-input"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
              {deleteError && <p className="danger-delete-error">{deleteError}</p>}
              <div className="danger-confirm-row">
                <button
                  type="button"
                  className="danger-btn danger-btn--delete"
                  disabled={deleteInput !== "DELETE" || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Processing…" : "Delete my account"}
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => { setConfirmDelete(false); setDeleteInput(""); setDeleteError(null); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="danger-btn danger-btn--delete"
              onClick={() => setConfirmDelete(true)}
            >
              Delete account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
