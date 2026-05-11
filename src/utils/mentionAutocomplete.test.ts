import { describe, expect, it } from "vitest";
import { filterMentionCandidates, type MentionPickUser } from "./mentionAutocomplete";

describe("filterMentionCandidates", () => {
  it("prioritizes followed users when query is empty", () => {
    const candidates: MentionPickUser[] = [
      { id: "u1", username: "zara" },
      { id: "u2", username: "alex", isFollowing: true },
      { id: "u3", username: "mario", isFollowing: true },
      { id: "u4", username: "bruno" },
    ];
    const result = filterMentionCandidates(candidates, "");
    expect(result.map((x) => x.id).slice(0, 2)).toEqual(["u2", "u3"]);
  });

  it("prioritizes recents when follow state is equal", () => {
    const candidates: MentionPickUser[] = [
      { id: "u1", username: "pepe", recentRank: 3 },
      { id: "u2", username: "ana", recentRank: 0 },
      { id: "u3", username: "luis", recentRank: 1 },
    ];
    const result = filterMentionCandidates(candidates, "");
    expect(result.map((x) => x.id)).toEqual(["u2", "u3", "u1"]);
  });

  it("keeps query filter while preserving priority", () => {
    const candidates: MentionPickUser[] = [
      { id: "u1", username: "carlos" },
      { id: "u2", username: "carla", isFollowing: true },
      { id: "u3", username: "cata", recentRank: 0 },
      { id: "u4", username: "mario", isFollowing: true },
    ];
    const result = filterMentionCandidates(candidates, "ca");
    expect(result.map((x) => x.username)).toEqual(["carla", "cata", "carlos"]);
  });
});

