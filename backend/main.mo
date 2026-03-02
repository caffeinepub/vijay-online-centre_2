import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATION: Removal of Unused Variable `nextDocumentId`
// ─────────────────────────────────────────────────────────────────────────────
// The field `nextDocumentId` is now removed from the persistent actor state.
// This migration ensures compatibility with the previous version.
// ─────────────────────────────────────────────────────────────────────────────

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── User Profile (required by instructions) ──────────────────────────────

  public type UserProfile = {
    name : Text;
    mobile : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Domain Types ─────────────────────────────────────────────────────────

  public type Customer = {
    name : Text;
    mobile : Text;
    password : Text;
  };

  public type ServiceOrder = {
    orderId : Nat;
    customerId : Text;
    serviceName : Text;
    name : Text;
    mobile : Text;
    address : Text;
    documentKey : Text;
    status : Text;
    amount : Nat;
    timestamp : Int;
  };

  public type AdminQRSettings = {
    permanentQrKey : Text;
    autoQrAmount : Nat;
  };

  public type PaymentConfirmation = {
    orderId : Nat;
    confirmedByAdmin : Bool;
    timestamp : Int;
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let customers = Map.empty<Text, Customer>();
  let serviceOrders = Map.empty<Nat, ServiceOrder>();
  var adminQRSettings : AdminQRSettings = {
    permanentQrKey = "";
    autoQrAmount = 0;
  };
  let paymentConfirmations = Map.empty<Nat, PaymentConfirmation>();
  var nextOrderId = 1;

  func getNextId() : Nat {
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  // ── Customer Registration & Login (public / guest-accessible) ────────────

  /// Anyone (including guests) may register a new customer account.
  public shared ({ caller = _ }) func registerCustomer(
    name : Text,
    mobile : Text,
    password : Text,
  ) : async () {
    if (mobile.size() != 10) {
      Runtime.trap("Mobile number must be exactly 10 digits");
    };
    switch (customers.get(mobile)) {
      case (?_) {
        Runtime.trap("Customer already exists with this mobile number");
      };
      case (null) {
        let newCustomer : Customer = { name; mobile; password };
        customers.add(mobile, newCustomer);
      };
    };
  };

  /// Anyone (including guests) may attempt to log in.
  public shared ({ caller = _ }) func loginCustomer(mobile : Text, password : Text) : async Bool {
    switch (customers.get(mobile)) {
      case (null) { false };
      case (?customer) { customer.password == password };
    };
  };

  // ── Order Submission (accessible to any caller; customerId is the app-level identity) ──

  /// The application uses a mobile/password authentication system independent of
  /// Internet Identity. Customers are identified by their customerId (mobile number).
  /// No IC-level role check is applied here; the customerId passed by the frontend
  /// represents the logged-in customer's identity within the app's own auth system.
  public shared ({ caller = _ }) func submitOrder(
    customerId : Text,
    serviceName : Text,
    name : Text,
    mobile : Text,
    address : Text,
    documentKey : Text,
    amount : Nat,
  ) : async Nat {
    // Validate that the customerId corresponds to a registered customer.
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Unauthorized: No registered customer found for the provided customerId. Please register or log in first.");
      };
      case (?_) {};
    };

    let orderId = getNextId();
    let newOrder : ServiceOrder = {
      orderId;
      customerId;
      serviceName;
      name;
      mobile;
      address;
      documentKey;
      status = "Form Submitted";
      amount;
      timestamp = Time.now();
    };
    serviceOrders.add(orderId, newOrder);
    orderId;
  };

  // ── Order Queries ─────────────────────────────────────────────────────────

  /// Any caller may query orders for a given customerId.
  /// The customerId acts as the app-level authorization token.
  /// Admins (IC-level) may also query any customer's orders.
  public query ({ caller = _ }) func getOrdersByCustomer(customerId : Text) : async [ServiceOrder] {
    serviceOrders.values().toArray().filter(func(order : ServiceOrder) : Bool {
      order.customerId == customerId;
    });
  };

  /// Admin-only: retrieve all submitted orders.
  public query ({ caller }) func getAllOrders() : async [ServiceOrder] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    serviceOrders.values().toArray();
  };

  // ── Order Status Management (admin only) ──────────────────────────────────

  /// Admin-only: update the status of a service order.
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = { order with status };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  // ── QR Settings (admin write, public read) ────────────────────────────────

  /// Admin-only: set the permanent QR image and/or auto-QR amount.
  public shared ({ caller }) func setPermQR(base64 : Text, autoAmount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set QR settings");
    };
    adminQRSettings := {
      permanentQrKey = base64;
      autoQrAmount = autoAmount;
    };
  };

  /// Anyone may retrieve the permanent QR image (needed to display payment QR to customers).
  public query ({ caller = _ }) func getPermQR() : async Text {
    adminQRSettings.permanentQrKey;
  };

  /// Anyone may retrieve the full QR settings (amount needed for auto-QR generation).
  public query ({ caller = _ }) func getQRSettings() : async AdminQRSettings {
    adminQRSettings;
  };

  // ── Payment Confirmation (admin write, app-level read) ────────────────────

  /// Admin-only: confirm that a payment has been received for an order,
  /// and advance the order status to 'Payment Completed'.
  public shared ({ caller }) func confirmPayment(orderId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm payments");
    };
    let confirmation : PaymentConfirmation = {
      orderId;
      confirmedByAdmin = true;
      timestamp = Time.now();
    };
    paymentConfirmations.add(orderId, confirmation);

    // Advance order status to 'Payment Completed'.
    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = {
          order with status = "Payment Completed"
        };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  /// Any caller may check the payment confirmation for an order.
  /// The customerId in the order acts as the app-level authorization token.
  public query ({ caller = _ }) func getPaymentConfirmation(orderId : Nat) : async ?PaymentConfirmation {
    paymentConfirmations.get(orderId);
  };
};
