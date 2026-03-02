# Specification

## Summary
**Goal:** Fix three critical issues in the Vijay Online Centre app: persistent login sessions, a broken logout button, and an "Unauthorized" error on form submissions.

**Planned changes:**
- Update AuthContext to save customer session (user ID, name, mobile, role) to localStorage on login and restore it automatically on app load, so the user stays logged in across refreshes and reopens.
- Fix the Logout button in the Layout component to clear the session from both AuthContext state and localStorage, then navigate the user back to the login/selection screen.
- Fix the "Unauthorized: Only authenticated users can submit orders" error by ensuring the authenticated customer's ID from AuthContext is correctly passed in all backend calls (submitOrder and similar mutations in useQueries.ts).
- Update the backend submitOrder (or equivalent) function in backend/main.mo to accept the customer ID supplied from the frontend OTP-based session instead of relying solely on Internet Identity principal.
- If session is missing or expired at submission time, redirect the user to login with a clear message instead of showing a raw unauthorized error.

**User-visible outcome:** Once logged in, customers remain logged in across page refreshes and app reopens. The logout button works correctly and returns users to the login screen. Customers can successfully submit service forms like "Niwas Praman Patra" without encountering any unauthorized errors.
