# Spherical – Technical Debt Audit & AI Risk Assessment

**Repository:** Spherical (Lovable.dev-generated)  
**Audit date:** January 2025

---

## Part 1: Technical Debt Audit

### 1. Scattered Data Access (No API/Service Layer)

**Category:** Architectural Debt  

**Description:** Supabase is imported and used directly in 8+ places: `Auth.tsx`, `usePlaylists.ts`, `useRegions.ts`, `useGeolocation.ts`, `useFriends.ts`, `UserMap.tsx`, `EmergingArtistsRecommendations.tsx`, `AddFriend.tsx`. There is no shared data-access or API layer. Queries, table names, and RLS assumptions are duplicated and hard to change. Adding caching, logging, or swapping backends would require edits across many files.

**Remediation Plan:** Introduce a thin API/service layer (e.g. `src/services/` or `src/api/`): region service, playlist service, auth service, profile service. All Supabase calls go through these modules. Pages and hooks call services only. Enables consistent error handling, typing, and future backend changes.

---

### 2. Zero Automated Tests

**Category:** Test Debt  

**Description:** The project has no unit or integration tests. There are no `*.test.ts(x)` or `*.spec.ts(x)` files, and `package.json` has no `test` script (no Vitest, Jest, or React Testing Library). AI-generated components (e.g. `useGeolocation`, `usePlaylists`, `UserMap`, forms in `Auth.tsx`) are not covered by any “trust but verify” protocol. Regressions are only caught manually.

**Remediation Plan:** Add Vitest + React Testing Library; add `"test": "vitest"` and `"test:coverage": "vitest run --coverage"`. Start with: (1) unit tests for pure logic (e.g. `useGeolocation` distance calculation, region-finding); (2) component tests for critical flows (auth form, playlist create); (3) integration tests for key Supabase flows (e.g. with MSW or test Supabase project). Enforce running tests in CI.

---

### 3. No Requirement Traceability or Domain Documentation

**Category:** Documentation Debt  

**Description:** The README is Lovable boilerplate (how to edit, deploy, domain). There is no mapping from code to product/Agile requirements (e.g. F1.1–F1.10, F2.1–F2.7, F4.x, F20.x). Components and hooks have minimal or no JSDoc; intent and “why” are not documented. New or AI contributors cannot easily see which files implement which features.

**Remediation Plan:** Add a requirements traceability section (e.g. `docs/REQUIREMENTS_TRACEABILITY.md` or table in README) mapping requirement IDs to components/hooks/pages. Add brief JSDoc to public hooks and key components (purpose, main props, relation to feature). Optionally add `docs/ARCHITECTURE.md` describing data flow and main modules.

---

### 4. Dead Code and Duplicate Sources of Truth

**Category:** Architectural Debt  

**Description:** `src/data/regions.ts` defines static `RegionData` and a full `regions` array (with different shape and IDs like `"west-africa"`) but is never imported anywhere. Regions are actually loaded from the Supabase `regions` table via `useRegions`. `RegionCard` exists but is never used; Index uses inline Buttons for “Other Regions.” This creates confusion about the single source of truth and risks future edits to the wrong place.

**Remediation Plan:** Remove or repurpose dead code: (1) Delete `src/data/regions.ts` if no plan to use it, or document and use it only for seed/mock data with a clear comment. (2) Either use `RegionCard` in Index for “Other Regions” or remove `RegionCard.tsx`. Establish one source of truth for region list (DB) and document it.

---

### 5. Sensitive Configuration and Secrets Handling

**Category:** Architectural Debt  

**Description:** Supabase URL and key are correctly read from `import.meta.env` (VITE_*). Mapbox token is not: users paste it into the UI and it is stored only in React state (`UserMap.tsx`). There is no `VITE_MAPBOX_*` env usage. `.gitignore` does not list `.env`, so `.env` could be committed and leak secrets. No documentation on which env vars are required for build or runtime.

**Remediation Plan:** Add `.env` and `.env.local` to `.gitignore`. Document required env vars in README or `docs/ENV.md` (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional `VITE_MAPBOX_PUBLIC_TOKEN`). For Mapbox: support optional `import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN` and fall back to user-entered token only when unset, so production can use env-based tokens.

---

## Part 2: AI & System Risk Assessment

### Risk 1: Reliability / Hallucination (Logic and Data Assumptions)

**Area:** Reliability/Hallucination  

**Description:** AI-generated code can encode wrong assumptions that are not caught without tests. Examples in this codebase: (1) `useGeolocation` assumes `regions` have `latitude`/`longitude`; if the DB has nulls or wrong types, “nearest region” can be wrong with no test to catch it. (2) `usePlaylists` and friends logic assume specific RLS and table shapes; schema or policy changes could break behavior silently. (3) Components like `UserMap` use `innerHTML` with user data (see Risk 2); such patterns are common in AI output and are a reliability/security trap.

**Mitigation:** Add unit tests for all “calculation” and “nearest X” logic; add integration tests for critical Supabase paths. Code review checklist that forbids `innerHTML`/`dangerouslySetInnerHTML` with unsanitized user input. Run tests in CI on every PR.

---

### Risk 2: Security & Ethics (XSS and Data Handling)

**Area:** Security & Ethics  

**Description:** In `UserMap.tsx`, user-provided `display_name` is interpolated into HTML and set via `el.innerHTML` and `setHTML()` for popups. If `display_name` contains script or event handlers, this is stored-XSS: any user viewing the map could execute code in other users’ sessions. There is no sanitization or CSP documented. A single malicious or compromised profile could affect all map viewers.

**Mitigation:** Never render user-controlled strings with `innerHTML` or `setHTML`. Use text escaping (e.g. createTextNode, or React’s default escaping) or a small sanitizer (e.g. DOMPurify) with a strict config. Add a CSP header in production. Consider validating/sanitizing `display_name` on the backend (Supabase trigger or Edge Function) and in the client before any DOM write.

---

### Risk 3: Dependency and Platform Coupling (Lovable & External APIs)

**Area:** Dependency Risk  

**Description:** The project depends on Lovable.dev (README links, `lovable-tagger` in devDependencies) and on external APIs: Supabase (auth, DB, realtime) and Mapbox (map). If Lovable changes its export format or tagging, local workflows could break. Supabase and Mapbox SDK/API changes could require non-trivial refactors because calls are spread across many files with no abstraction layer.

**Mitigation:** Reduce coupling: (1) Introduce the API/service layer (see Debt #1) so Supabase and Mapbox are behind a small set of modules; (2) Pin major/minor versions of `@supabase/supabase-js` and `mapbox-gl` in package.json and review release notes before upgrades; (3) Document “supported” Supabase and Mapbox versions and where they are used. For Lovable: treat it as one possible editor; avoid relying on Lovable-specific behavior in core app logic so the app remains IDE- and CI-friendly.

---

## Part 3: Backlog Integration

Convert the **top 3 technical debt items** into backlog issues with labels and LLM-drafted acceptance criteria.

**Suggested labels:** `technical-debt`, `refactor`

---

### Backlog Item 1 (Highest priority)

**Title:** Introduce API/Service layer for Supabase and data access  

**Labels:** `technical-debt`, `refactor`  

**Description (for issue body):**  
Currently Supabase is called directly from many components and hooks (Auth, usePlaylists, useRegions, useGeolocation, useFriends, UserMap, EmergingArtistsRecommendations, AddFriend). This makes the app hard to change, test, and reason about. We should add a clear API boundary so all data access goes through dedicated services.

**Acceptance criteria (AI-aware refinement):**

- [ ] **AC1:** A new `src/services/` (or `src/api/`) directory exists with at least: `regions.ts`, `playlists.ts`, `auth.ts`, `profiles.ts` (or equivalent grouping). Each module exports functions that perform the current Supabase operations (e.g. `getRegions()`, `getRegionTracks(regionId)`, `getPlaylists(userId)`).
- [ ] **AC2:** No component or hook imports `@/integrations/supabase/client` for data operations. They may only use the new service modules (and, if needed, a single place that creates the Supabase client for services).
- [ ] **AC3:** All existing behavior preserved: region list, region tracks/artists, playlists, shared playlists, friends, auth, UserMap profile locations, and EmergingArtists recommendations work as before (verified manually or by existing E2E).
- [ ] **AC4:** README or `docs/ARCHITECTURE.md` updated to describe the service layer and the rule: “Data access only via `src/services/*`.”

---

### Backlog Item 2 (High priority)

**Title:** Add test suite and CI for critical paths  

**Labels:** `technical-debt`, `refactor`  

**Description (for issue body):**  
The project has no automated tests. We need a minimal “trust but verify” setup for core logic and AI-generated code: unit tests for pure logic, and basic component/integration tests for critical user flows.

**Acceptance criteria (AI-aware refinement):**

- [ ] **AC1:** Vitest (and React Testing Library if needed) is added; `package.json` includes scripts: `"test": "vitest"` and `"test:coverage": "vitest run --coverage"`.
- [ ] **AC2:** At least one unit test exists for `useGeolocation` (e.g. distance calculation and/or nearest-region logic) that can run without Supabase (e.g. mocked or pure function extracted).
- [ ] **AC3:** At least one component or integration test covers a critical flow: e.g. Auth page (sign in form validation or submit) or Create Playlist (open dialog, submit, assert mutation/state). Supabase may be mocked (MSW or Vitest mock).
- [ ] **AC4:** A CI workflow (e.g. GitHub Actions) runs `npm run test` (or equivalent) on push/PR to the main branch and fails the check if tests fail.

---

### Backlog Item 3 (High priority)

**Title:** Remove XSS risk in UserMap (sanitize/escape user content)  

**Labels:** `technical-debt`, `refactor`, `security`  

**Description (for issue body):**  
UserMap renders `display_name` via `innerHTML` and Mapbox `setHTML()`. This is an XSS vector if a user sets a malicious `display_name`. We must render user content safely.

**Acceptance criteria (AI-aware refinement):**

- [ ] **AC1:** No use of `innerHTML` or `setHTML()` with raw `display_name` (or any other user-controlled string). Use either: (a) text-only rendering (e.g. createTextNode, or Mapbox popup API that sets text), or (b) a sanitizer (e.g. DOMPurify) with a strict allowlist applied to user content before any DOM write.
- [ ] **AC2:** Map popups and markers still show the correct display name (or “Anonymous” when null) and remain readable and styled appropriately.
- [ ] **AC3:** A brief comment or one-line doc in the component explains that user content is escaped/sanitized to prevent XSS. Optionally: add a note in `docs/SECURITY.md` or README about safe rendering of user-generated content.

---

## Summary

| Part   | Count | Focus |
|--------|-------|--------|
| Debt   | 5     | Architecture (data layer, dead code, config), Test (no tests), Documentation (traceability) |
| Risks  | 3     | Hallucination/logic, Security (XSS), Dependency (Lovable, Supabase, Mapbox) |
| Backlog| 3     | Service layer, Test suite + CI, UserMap XSS fix |

**Next steps:** Create the three issues in your GitHub project, add labels `technical-debt` and `refactor` (and `security` for the UserMap issue), and copy the acceptance criteria above into the issue descriptions or as a checklist in the first comment.

---

## Appendix: Test Setup & Commands

The current project now has a minimal test infrastructure using **Vitest**, **React Testing Library**, and **jsdom**.

- **Install dependencies** (once, after cloning):
  - `npm install`
- **Run the full test suite**:
  - `npm run test`
- **Run tests in watch mode** (optional, if you add a `test:watch` script later):
  - `npm run test:watch`
- **Generate a coverage report** (optional, if you add a `test:coverage` script later):
  - `npm run test:coverage`

Vitest is configured to discover test files matching:

- `**/*.{test,spec}.?(c|m)[jt]s?(x)`

Preferred conventions:

- Place unit tests for hooks and utilities next to their implementations as `*.test.ts`.
- Place component tests next to components as `*.test.tsx`.
- Use `src/example.test.ts` as a reference for a minimal smoke test.
