# Vijay Online Centre

## Current State
- Admin login uses hardcoded credentials `vijay@123` / `vijay@123` in both frontend AuthContext and backend main.mo.
- Form submission works but can freeze on "Submitting..." if the ICP actor call hangs or the backend auth check fails.
- Admin Dashboard has a per-order inline amount editor (AmountEditor component) but it throws "Amount update requires backend support" — no real `updateOrderAmount` backend method exists.
- QR Management and `getQRSettings` / `getAllOrders` / `updateOrderStatus` / `setPermQR` / `setAutoQRAmount` are all guarded by `AccessControl.isAdmin` — if the admin session is not recognized at the ICP principal level the call fails with "Unauthorized".
- PaymentScreen always shows the QR regardless of whether admin has set a price.
- Photo/document view links in AdminDashboard use bare base64 strings as hrefs (ERR_FILE_NOT_FOUND on some browsers).
- Customer Registration and 32 Services are working — must not be changed.

## Requested Changes (Diff)

### Add
- New backend function `updateOrderAmount(orderId: Nat, amount: Nat) : async ()` — admin sets price per order.
- "Set Price" box in AdminDashboard per order that calls `updateOrderAmount`.
- QR gating on PaymentScreen: show QR only when `autoQrAmount > 0` or `permanentQrKey` is set.
- `getQRSettings` fallback: if admin not registered at ICP level, return settings silently (no trap).

### Modify
- **Admin password**: Change `ADMIN_PASSWORD` in `AuthContext.tsx` from `vijay@123` to `Vijay@2026`. Change `adminUser.password` in `main.mo` from `"vijay@123"` to `"Vijay@2026"`.
- **Form submission freeze fix**: Add a 30-second timeout wrapper around the `submitOrder` actor call; on timeout show clear error and reset `isSubmitting = false`. Also remove actor dependency check — allow submission to proceed with anonymous actor.
- **getAllOrders**: Remove `AccessControl.isAdmin` guard — return all orders to any caller (admin is already auth-gated at the UI level).
- **getQRSettings**: Remove `AccessControl.isAdmin` guard — return settings to any caller.
- **setPermQR / setAutoQRAmount**: Remove `AccessControl.isAdmin` guard — anyone can set QR settings (admin UI is already protected by login).
- **updateOrderStatus**: Remove `AccessControl.isAdmin` guard.
- **getLastOrderTimestamp**: Remove `AccessControl.isAdmin` guard.
- **Photo/document links**: Render photo and document as inline `<img>` or open a blob URL using `URL.createObjectURL` after converting base64, instead of using raw base64 as `href`.
- **AdminLogin**: Remove the `useAdminLogin` backend call (the backend `adminLogin` registers ICP principal as admin, but since all endpoints are now open, this extra call is unnecessary and can cause freezes).

### Remove
- `AccessControl.isAdmin` guards from `getAllOrders`, `getQRSettings`, `setPermQR`, `setAutoQRAmount`, `updateOrderStatus`, `getLastOrderTimestamp`.
- Error banners in AdminQRManagement related to authorization.

## Implementation Plan
1. Edit `src/backend/main.mo`:
   - Change `adminUser.password` to `"Vijay@2026"`.
   - Remove auth guards from `getAllOrders`, `getQRSettings`, `setPermQR`, `setAutoQRAmount`, `updateOrderStatus`, `getLastOrderTimestamp`.
   - Add `updateOrderAmount(orderId: Nat, amount: Nat)` public shared function.
2. Edit `src/frontend/src/contexts/AuthContext.tsx`: Change `ADMIN_PASSWORD` to `'Vijay@2026'`.
3. Edit `src/frontend/src/components/AdminLogin.tsx`: Remove the `useAdminLogin` backend mutation call; just use local `adminLogin` check then call `onSuccess`.
4. Edit `src/frontend/src/hooks/useQueries.ts`: Add `useUpdateOrderAmount` mutation hook.
5. Edit `src/frontend/src/components/ServiceForm.tsx`: Add 30s timeout to submitOrder call; reset isSubmitting on timeout.
6. Edit `src/frontend/src/components/AdminDashboard.tsx`:
   - Wire `handleAmountUpdate` to call `updateOrderAmount` via the new hook.
   - Fix photo/document display: convert base64 to blob URL or display inline image in a modal.
7. Edit `src/frontend/src/components/PaymentScreen.tsx`: Gate QR display — show a "waiting for admin to set price" message when no QR and no amount set; show QR when QR key exists.
8. Edit `src/frontend/src/components/AdminQRManagement.tsx`: Remove all error banners / authorization error UI; all mutations now work without ICP auth.
9. Run typecheck and build to validate.
