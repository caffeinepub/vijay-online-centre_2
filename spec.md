# Specification

## Summary
**Goal:** Fix the admin dashboard so that new customer form submissions appear immediately and automatically without requiring a manual page refresh.

**Planned changes:**
- Invalidate and refetch the admin orders list automatically after a customer successfully submits a service order form.
- Add periodic polling (every 10–15 seconds) to the admin dashboard so new orders appear in near real-time while the admin is on the dashboard screen.
- Ensure the backend `getOrders` endpoint returns all submitted orders (including just-submitted ones) sorted by most recent first, with no race conditions or buffering issues causing newly submitted orders to be temporarily invisible.

**User-visible outcome:** After a customer submits a service form, the admin dashboard automatically shows the new order without any manual refresh, and continues to stay up to date via periodic polling.
