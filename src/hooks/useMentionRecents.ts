import { useCallback, useEffect, useState } from "react";
import type { MentionPickUser } from "../utils/mentionAutocomplete";

const MENTION_RECENTS_LIMIT = 12;

function mentionRecentsStorageKey(userId: string) {
  return `goi:mentionRecents:v1:${userId}`;
}

/**
 * IDs de usuarios mencionados recientemente (persistido en `localStorage`), para priorizar el autocompletado @.
 */
export function useMentionRecents(userId: string | undefined) {
  const [recentMentionIds, setRecentMentionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setRecentMentionIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(mentionRecentsStorageKey(userId));
      if (!raw) {
        setRecentMentionIds([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setRecentMentionIds([]);
        return;
      }
      setRecentMentionIds(
        parsed.filter((x): x is string => typeof x === "string").slice(0, MENTION_RECENTS_LIMIT),
      );
    } catch {
      setRecentMentionIds([]);
    }
  }, [userId]);

  const recordMentionPick = useCallback(
    (picked: MentionPickUser) => {
      if (!userId) return;
      if (picked.id === userId) return;
      setRecentMentionIds((current) => {
        const next = [picked.id, ...current.filter((id) => id !== picked.id)].slice(0, MENTION_RECENTS_LIMIT);
        try {
          localStorage.setItem(mentionRecentsStorageKey(userId), JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [userId],
  );

  return { recentMentionIds, recordMentionPick };
}
