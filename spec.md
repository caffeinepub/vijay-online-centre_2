# Specification

## Summary
**Goal:** Build "Vijay Online Centre" — a complete digital service platform for applying to 32 government/utility services, with admin management, order tracking, payment via UPI QR, and an AI chatbot assistant.

**Planned changes:**

### Splash Screen
- Display logo, app name "Vijay Online Centre", and Hindi welcome message "स्वागत है आपका हमारे विजय ऑनलाइन प्लेटफ़ॉर्म पर" for ~2 seconds with fade-in animation before transitioning to login

### Authentication
- Admin login screen with hardcoded credentials (vijay@123user / vijay@2026), session persisted in localStorage with no expiry
- Customer login screen with manual mode (mobile + PIN) and simulated OTP mode (OTP displayed in-app); unlimited customer accounts stored in backend with no expiry

### Service Catalog
- Searchable grid of all 32 services as tappable cards with real-time filter input
- Services: Aay Praman Patra, Jati Praman Patra, Niwas Praman Patra, Janm Praman Patra, Mrityu Praman Patra, Naya Pan Card, Pan Card Correction, Aadhar Card Update, Voter ID New, Ration Card Online, Ayushman Card, Driving License, Naya Passport, PF Withdrawal/KYC, E-Shram Card, Pension KYC, Bijli Bill Payment, Gadi ka Bima, Railway Ticket, Flight Ticket, PM Kisan Registration, Vridha Pension, Vidhwa Pension, Divyang Pension, Kanya Sumangala Yojana, UP Scholarship, Charitra Praman Patra, Police Verification, Bhulekh, Shadi Registration, Udyam Registration, Gazette Notification

### Service Application Form
- Shared form for all 32 services: Name, Mobile Number, Address, Document Upload (image/PDF as base64), Submit button
- On submit, save to backend with timestamp, service name, customer info, and initial status "Form Submitted"
- Show confirmation message after successful submission

### Admin Dashboard
- Protected by admin login; lists all submitted orders with customer name, address, service, document preview, date/time
- Accept button advances status; Reject button marks order "Rejected"
- Polls backend periodically to reflect new submissions without full page reload

### Payment System
- Permanent QR mode: admin uploads a QR image once (default: the provided ICICI Bank PhonePe QR image); stored in backend and shown to all customers
- Auto QR Generate mode: admin enters amount, frontend generates UPI deep-link QR dynamically
- Admin manually confirms payment, advancing order status to "Payment Completed"

### Order Tracking
- 4-stage Flipkart-style horizontal stepper: Form Submitted → Payment Completed → Processing (Admin Working) → Filling Completed
- Active stage highlighted; completed stages filled; future stages grayed out
- Accessible from "My Orders" section

### Receipt System
- Auto-generated receipt shown when order reaches "Filling Completed"
- Displays: Vijay Online Centre header, Service Name, Amount Paid, Date & Time, Payment Status
- Printable/downloadable via browser print dialog; Navy Blue & Silver theme

### Vijay AI Chatbot
- Floating chat button on all screens; slide-up panel with "Vijay AI — 24x7 Assistant" header
- Rule-based responses in Hindi and English covering: service application help, payment help, order tracking, contact info, general platform guidance
- Close/minimize button

### Contact Section
- WhatsApp button → wa.me/918173064549
- Call button → tel:+918173064549
- Google Maps button → external maps search link
- Phone number +91 81730 64549 displayed prominently

### UI/Theme
- Navy Blue (#0A1628 / #0D2137) and Silver (#C0C0C0 / #E8E8E8) theme across all screens
- Bottom navigation bar: Home, Services, My Orders, Contact, Dashboard (admin only)
- Mobile-first layout, minimum 360px width, no horizontal scroll or zoom issues
- Smooth page transition animations and card hover/press effects

### Backend (Motoko)
- Stable variables for: customer accounts, service order submissions (with all fields including documentBase64), admin QR settings, payment confirmation records
- Exposed functions: submitOrder, getOrdersByCustomer, getAllOrders (admin), updateOrderStatus (admin), setPermQR (admin), getPermQR, confirmPayment (admin)

**User-visible outcome:** Customers can register/login, browse and apply for any of 32 government/utility services, track their order through 4 stages, scan a UPI QR to pay, and receive a printable receipt on completion — while admins manage all orders, QR settings, and payment confirmations from a protected dashboard.
