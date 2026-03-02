# Specification

## Summary
**Goal:** Fix four critical issues in the Vijay Online Centre admin panel: authorization barriers, form submission failures, photo storage/retrieval errors, and non-functional Accept/Reject buttons.

**Planned changes:**
- Remove all authorization error messages and re-login prompts from the Admin Dashboard and Admin QR Management panel; persist admin session (vijay@123) reliably in localStorage so it never expires or requires re-authentication after login.
- Fix the ServiceForm component so form submission never shows a "Failed" error; optimize the backend `submitOrder` function to return responses promptly without hanging or timing out.
- Fix photo/document display in the Admin Dashboard so clicking the "Photo" button renders the base64-stored image immediately as a data URL, eliminating ERR_FILE_NOT_FOUND errors.
- Wire the "Accept" and "Reject" buttons in the Admin Dashboard to the backend `updateOrderStatus` function; reflect the updated order status immediately on the card with inline success or error messages.

**User-visible outcome:** The admin can log in once and manage all orders without interruption — submitting forms succeeds, attached photos display correctly, and Accept/Reject actions update order statuses instantly.
