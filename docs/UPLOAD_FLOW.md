# How uploads work in this frontend

This app does **not** send file bytes through your main API. It uses a **presigned URL** pattern: the backend signs an upload to object storage (S3); the browser uploads the file **directly** to that URL; then the app stores the returned **public URL** on the next API call (create artwork, update profile, etc.).

---

## 1. Building blocks

### 1.1 API base URL

- Authenticated JSON requests (including “give me a presigned URL”) go through Axios with `baseURL` from `getServerBaseUrl()` in `src/lib/api-config.ts` (typically `{origin}/api` unless `VITE_SERVER_BASE_URL` overrides it).
- `src/hooks/use-axios-auth.ts` creates that client with `withCredentials: true` so session cookies are sent on presign requests.

### 1.2 Presign endpoints (backend)

The frontend calls these **POST** routes (relative to the `/api` base):

| Purpose | Route |
|--------|--------|
| Single image | `/upload/presigned/image` |
| Multiple images (batch) | `/upload/presigned/images` |
| Document | `/upload/presigned/document` |

Implemented in:

- `src/services/upload.ts` — direct `api.post(...)` helpers (same paths).
- `src/queries/uploadQueries.ts` — React Query mutations wrapping the same paths via `useMutationFunc` (used by most UI).

**Request body (single / document):** `fileName`, `contentType`, optional `expirySeconds` (often `3600`). See `src/types/upload.types.ts`.

**Response:** `success`, `presignedUrl`, `publicUrl`, `objectKey` (and for batch, an array of entries with per-file data).

### 1.3 Browser upload to storage

`uploadFileToS3` in `src/services/upload.ts`:

1. `fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": ... } })`
2. **Important:** `Content-Type` must match **exactly** what was sent when generating the presigned URL (usually `file.type`).
3. **Do not** add extra headers (Authorization, custom headers, etc.) — that can invalidate the signature.
4. On failure, errors distinguish 403 (often expiry or Content-Type mismatch) vs 400.

---

## 2. End-to-end flow (generic)

1. **User picks a file** in the UI (`<input type="file">` or drag-and-drop, depending on screen).
2. **Presign:** UI calls the backend with `fileName`, `contentType`, `expirySeconds`.
3. **Upload:** UI `PUT`s the raw `File` to `presignedUrl`.
4. **Persist:** UI uses `publicUrl` (HTTPS URL to the object) in a follow-up mutation (e.g. create artwork with `photos: string[]`, or save profile `avatar` URL).

If the user is not logged in, presign requests can 401; `use-axios-auth` may redirect to login on protected routes.

---

## 3. Feature-specific flows

### 3.1 Sell new artwork — `src/components/sellArtWork/sellArtForm.tsx`

1. Form validates with Zod (`artworkFormSchema`).
2. **Photos:** For each selected photo file, call `getPresignedImageUrl` → `uploadFileToS3` → collect `publicUrl`s (parallel via `Promise.all` over files).
3. **Proof of origin (optional file):** `getPresignedDocumentUrl` → `uploadFileToS3` → `publicUrl`.
4. **Create artwork:** `createArtwork(...)` with `photos: photoUrls` and `proofOfOrigin: proofOfOriginUrl` (DTO in `src/types/artwork.types.ts`).
5. Navigate to `/artwork/:id` or fallback `/buyart`.

### 3.2 Edit artwork — `src/components/sellArtWork/editArtworkForm.tsx`

1. **New** photos (only `File` instances): same per-file presign + S3 PUT as sell flow; **existing** entries that are already `http...` strings are kept.
2. **Proof of origin:** If the field is a new `File`, document presign + upload; if unchanged string, keep; if cleared, may set `undefined`.
3. Submit update payload with merged photo URLs and proof URL.

### 3.3 Blog featured image — `src/components/blog/create-blog-modal.tsx`, `src/pages/EditBlog.tsx`

1. If a local featured image file is selected: presign image → S3 PUT → use `publicUrl` as `featuredImage`.
2. If no file, use URL string already on the form (if any).
3. Create or update blog post with that string.

### 3.4 Profile / edit profile avatars and covers — `src/pages/Profile.tsx`, `src/pages/EditProfile.tsx`

1. Presign image for the chosen file.
2. S3 PUT.
3. Save profile with the returned `publicUrl` (avatar and/or cover flows as implemented on each page).

### 3.5 Collection cover images — `src/pages/Collections.tsx`, `src/pages/CollectionDetail.tsx`, `src/pages/PublicCollections.tsx`, `src/components/artwork/artwork-collection-manager.tsx`

1. Presign image for cover file.
2. S3 PUT.
3. Create or update collection (or related action) with the cover `publicUrl`.

---

## 4. Batch presign hook (available but not used for artwork photos)

`useGetPresignedMultipleImageUploadUrls` in `src/queries/uploadQueries.ts` posts to `/upload/presigned/images` with a `files: [{ fileName, contentType }, ...]` payload.

The sell/edit artwork forms currently use **one presign request per file** via `useGetPresignedImageUploadUrl`, not the batch endpoint.

---

## 5. Local development vs production

- **Presign requests** always go to the configured API (`getServerBaseUrl()`).
- **S3 PUT** goes to whatever host is in `presignedUrl` (typically an S3 or R2 URL), not your API origin.
- For local dev, `vite.config.ts` can proxy `/api` to `VITE_BETTER_AUTH_URL` so the browser talks to same origin while the dev server forwards to the backend.

---

## 6. Troubleshooting checklist

| Symptom | Likely cause |
|--------|----------------|
| 403 on PUT | Expired presigned URL, or `Content-Type` does not match presign request |
| 400 on PUT | Bad request body/headers; verify Content-Type |
| 401 on presign | Not authenticated or session expired |
| CORS errors on PUT | Storage bucket CORS must allow the browser origin and `PUT` |

---

## 7. Quick file map

| File | Role |
|------|------|
| `src/services/upload.ts` | Presign API wrappers + `uploadFileToS3` |
| `src/queries/uploadQueries.ts` | React Query mutations for presign |
| `src/types/upload.types.ts` | DTOs / response shapes |
| `src/hooks/use-axios-auth.ts` | Axios instance + credentials |
| `src/lib/api-config.ts` | Base URL resolution |
