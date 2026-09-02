---
name: Supabase RLS with connector
description: Why the app connector can reach Supabase but still be denied by RLS
---

The Supabase application connector can be healthy while using an anon/public key.
That key reaches PostgREST but cannot insert, read, or update protected `leads`
rows unless matching RLS policies exist.

**Why:** The lead pipeline needs a private deduplication lookup followed by an
insert/update, and the table intentionally has no public policies.

**How to apply:** Prefer a server credential managed by the integration. If the
provider only permits an anon key, replace direct table access with a narrowly
scoped `SECURITY DEFINER` RPC that validates the input and returns only the
minimal result.