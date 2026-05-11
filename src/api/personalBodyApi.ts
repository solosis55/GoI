import { apiFetch } from "./client";
import type { PersonalBodyBundle } from "../utils/personalBodyPrefs";

export type PersonalBodyGetResponse = {
  serverWrittenAt: string | null;
  bundle: unknown;
};

export function fetchPersonalBody() {
  return apiFetch<PersonalBodyGetResponse>("/auth/personal-body");
}

export function putPersonalBody(bundle: PersonalBodyBundle) {
  return apiFetch<{ ok: boolean; serverWrittenAt: string }>("/auth/personal-body", {
    method: "PUT",
    body: JSON.stringify({ bundle }),
  });
}
