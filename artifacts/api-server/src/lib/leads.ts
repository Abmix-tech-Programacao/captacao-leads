import { randomUUID } from "node:crypto";
import {
  supabaseRequest,
  SupabaseRequestError,
} from "./supabase";

export type LeadInput = {
  name: string;
  age: number;
  email: string;
  phone: string;
  city: string;
  notes?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  request_id?: string | null;
  privacy_version?: string | null;
  consent: boolean;
};

type NormalizedLead = {
  name: string;
  age: number;
  email: string;
  email_normalized: string;
  phone: string;
  phone_normalized: string;
  city: string;
  notes: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  request_id: string;
  consent: boolean;
  consent_at: string;
  privacy_version: string;
};

type ExistingLead = {
  id: string;
  email_normalized: string;
  phone_normalized: string;
};

type SavedLead = {
  lead: unknown;
  created: boolean;
};

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeLead(input: LeadInput): NormalizedLead {
  const email = cleanText(input.email, 320).toLowerCase();
  const phone = cleanText(input.phone, 40);

  return {
    name: cleanText(input.name, 120),
    age: input.age,
    email,
    email_normalized: email,
    phone,
    phone_normalized: normalizePhone(phone),
    city: cleanText(input.city, 100),
    notes: cleanText(input.notes, 1000) || null,
    source: cleanText(input.source, 120) || null,
    utm_source: cleanText(input.utm_source, 120) || null,
    utm_medium: cleanText(input.utm_medium, 120) || null,
    utm_campaign: cleanText(input.utm_campaign, 120) || null,
    request_id: cleanText(input.request_id, 120) || randomUUID(),
    consent: input.consent,
    consent_at: new Date().toISOString(),
    privacy_version:
      cleanText(input.privacy_version, 30) || "v1",
  };
}

async function findExistingLead(
  lead: NormalizedLead,
): Promise<ExistingLead | null> {
  const query = new URLSearchParams({
    or: `(email_normalized.eq.${lead.email_normalized},phone_normalized.eq.${lead.phone_normalized})`,
    select: "id,email_normalized,phone_normalized",
    limit: "1",
  });
  const matches = await supabaseRequest<ExistingLead[]>(
    `leads?${query.toString()}`,
  );
  return Array.isArray(matches) ? matches[0] ?? null : null;
}

function leadPayload(lead: NormalizedLead) {
  return {
    name: lead.name,
    age: lead.age,
    email: lead.email,
    email_normalized: lead.email_normalized,
    phone: lead.phone,
    phone_normalized: lead.phone_normalized,
    city: lead.city,
    notes: lead.notes,
    source: lead.source,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
    request_id: lead.request_id,
    consent: lead.consent,
    consent_at: lead.consent_at,
    privacy_version: lead.privacy_version,
    updated_at: new Date().toISOString(),
  };
}

async function updateExistingLead(
  existing: ExistingLead,
  lead: NormalizedLead,
): Promise<SavedLead> {
  const updated = await supabaseRequest<unknown[]>(
    `leads?id=eq.${encodeURIComponent(existing.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: leadPayload(lead),
    },
  );
  return { lead: updated?.[0] ?? { id: existing.id }, created: false };
}

async function createLead(lead: NormalizedLead): Promise<SavedLead> {
  const created = await supabaseRequest<unknown[]>("leads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: leadPayload(lead),
  });
  return { lead: created?.[0] ?? null, created: true };
}

async function saveDirectly(lead: NormalizedLead): Promise<SavedLead> {
  const existing = await findExistingLead(lead);
  if (existing) return updateExistingLead(existing, lead);

  try {
    return await createLead(lead);
  } catch (error) {
    if (!(error instanceof SupabaseRequestError) || error.providerStatus !== 409) {
      throw error;
    }

    const racedLead = await findExistingLead(lead);
    if (!racedLead) throw error;
    return updateExistingLead(racedLead, lead);
  }
}

async function sendToN8n(lead: NormalizedLead): Promise<void> {
  const webhook = process.env.N8N_WEBHOOK_URL;
  if (!webhook) {
    throw new Error("n8n webhook is not configured");
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error(`n8n request failed with status ${response.status}`);
  }
}

export async function processLead(input: LeadInput): Promise<SavedLead> {
  const lead = normalizeLead(input);
  const pipeline = process.env.LEAD_PIPELINE_MODE ?? "direct";

  if (pipeline === "n8n") {
    await sendToN8n(lead);
    return { lead: null, created: true };
  }

  if (pipeline !== "direct") {
    throw new Error(`Unsupported lead pipeline: ${pipeline}`);
  }

  return saveDirectly(lead);
}