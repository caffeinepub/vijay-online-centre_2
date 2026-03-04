# Vijay Online Centre

## Current State

- Full-stack app with Motoko backend and React frontend
- Customer form (ServiceForm.tsx) supports single photo and single document upload (base64)
- Backend `ServiceOrder` type has `photoDataBase64: Text` and `documentDataBase64: Text` (single strings)
- `submitOrder` function takes single photo/document base64 strings
- Frontend form converts files to base64 and submits via `submitOrder` mutation
- Admin dashboard shows photo/document preview using `photoDataBase64` and `documentDataBase64` fields
- Timeout handling exists in ServiceForm but uses a fixed 30s race against the backend call

## Requested Changes (Diff)

### Add
- `uploadedPhotos: [Text]` array field to `ServiceOrder` (up to 6-7 photos)
- `uploadedDocuments: [Text]` array field to `ServiceOrder` (up to 6-7 documents)
- New `submitOrderV2` backend function accepting arrays for photos and documents
- Multi-file input support (multiple attribute) for both photo and document boxes in ServiceForm
- Thumbnail preview grid showing all selected files after upload
- Admin dashboard support to view all uploaded photos and documents from arrays

### Modify
- `ServiceOrder` type: add `uploadedPhotos: [Text]` and `uploadedDocuments: [Text]` fields (keep existing single-file fields for backward compat)
- `submitOrder` backend function: also accept/store arrays (or add new function); return immediately after saving to prevent timeout
- Frontend `ServiceForm`: replace single-file handlers with multi-file handlers (max 6-7 files each), show thumbnail grid
- `useSubmitOrder` hook: update params to include `uploadedPhotos` and `uploadedDocuments` arrays
- `backend.d.ts`: add new fields and updated function signature
- Admin dashboard `OrderCard`: show all photos/documents from arrays with preview buttons

### Remove
- Nothing — preserve all existing working systems (QR, dashboard, receipt, login, auth)

## Implementation Plan

1. Update `ServiceOrder` type in `main.mo` to add `uploadedPhotos` and `uploadedDocuments` Text arrays alongside existing fields
2. Update `submitOrder` in `main.mo` to accept `uploadedPhotos` and `uploadedDocuments` arrays, store them, wrap in try/respond pattern to avoid timeout
3. Regenerate `backend.d.ts` to reflect new function signature and type
4. Update `useSubmitOrder` hook parameters to include photo/document arrays
5. Rewrite `ServiceForm.tsx` upload sections: multi-file input (max 7), thumbnail grid preview, convert all files to base64 arrays
6. Update `AdminDashboard.tsx` `OrderCard` to render all photos and documents from the arrays
