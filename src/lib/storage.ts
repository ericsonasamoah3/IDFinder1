export type IDType =
  | "national_id"
  | "drivers_license"
  | "passport"
  | "student_id"
  | "work_id"
  | "other";

export type LostStatus = "searching" | "matched" | "recovered";
export type FoundStatus = "unclaimed" | "matched" | "returned";

export type LostIDRecord = {
  id: string;
  created_date: string;
  owner_name: string;
  owner_email: string;
  id_type: IDType;
  id_number_hint?: string;
  last_seen_location?: string;
  description?: string;
  status: LostStatus;
  matched_found_id?: string;
};

export type FoundIDRecord = {
  id: string;
  created_date: string;
  name_on_id: string;
  id_type: IDType;
  id_number_hint?: string;
  found_location: string;
  photo_url?: string;
  finder_name?: string;
  finder_contact: string;
  description?: string;
  status: FoundStatus;
  matched_lost_id?: string;
};

const BASE = import.meta.env.VITE_IDFINDER_API_BASE as string;

function assertBase() {
  if (!BASE) throw new Error("VITE_IDFINDER_API_BASE is not set");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  assertBase();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    console.log("API Error:", res.status, data); 
    throw new Error(msg);
  }

  return data as T;
}

// ---------- LIST ----------
export async function listLostIDs(limit = 50): Promise<LostIDRecord[]> {
  const resp = await apiFetch<{ ok: true; items: LostIDRecord[] }>(
    `/IDfinder?record_type=lost&limit=${encodeURIComponent(String(limit))}`,
    { method: "GET" }
  );

  return [...(resp.items ?? [])].sort(
    (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );
}

export async function listFoundIDs(limit = 50): Promise<FoundIDRecord[]> {
  const resp = await apiFetch<{ ok: true; items: FoundIDRecord[] }>(
    `/IDfinder?record_type=found&limit=${encodeURIComponent(String(limit))}`,
    { method: "GET" }
  );

  return [...(resp.items ?? [])].sort(
    (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );
}

// ---------- CREATE ----------
export type CreateLostInput = Omit<LostIDRecord, "id" | "created_date" | "status"> & {
  status?: LostStatus;
};

export async function createLostID(input: CreateLostInput): Promise<LostIDRecord> {
  const resp = await apiFetch<{ ok: true; item: LostIDRecord }>(`/IDfinder`, {
    method: "POST",
    body: JSON.stringify({ mode: "lost", ...input }),
  });
  return resp.item;
}

export type CreateFoundInput = Omit<FoundIDRecord, "id" | "created_date" | "status"> & {
  status?: FoundStatus;
};

export async function createFoundID(input: CreateFoundInput): Promise<FoundIDRecord> {
  const resp = await apiFetch<{ ok: true; item: FoundIDRecord }>(`/IDfinder`, {
    method: "POST",
    body: JSON.stringify({ mode: "found", ...input }),
  });
  return resp.item;
}
