# Vijay Online Centre

## Current State
Full-stack app with admin/customer login, 32 services, order submission, admin dashboard, QR management, order tracking, and receipt system. The backend uses ICP AccessControl for admin identity checks on QR-setting functions. The frontend admin login stores session in localStorage only — it does NOT establish an ICP-level identity. This causes "Unauthorized" errors when admin tries to save QR image or set auto QR amount, because the ICP caller principal does not match the AccessControl admin identity.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `setPermQR`: Remove ICP AccessControl check — make caller-agnostic (public, no auth guard). Admin authorization is enforced at the frontend session level.
- `setAutoQRAmount`: Same — remove ICP AccessControl check.

### Remove
- ICP-level authorization guard from `setPermQR` and `setAutoQRAmount` only. All other functions remain unchanged.

## Implementation Plan
1. Regenerate backend Motoko with `setPermQR` and `setAutoQRAmount` as public (caller = _), no AccessControl.isAdmin check.
2. Keep all other backend functions (orders, receipt, customer/admin auth, order status, tracking) exactly as-is.
3. No frontend changes needed — QR management UI already works correctly.
