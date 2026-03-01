import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

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
  var nextDocumentId = 1;

  // For realistic unique IDs, use time-based fallback if counter overflows
  func getNextId() : Nat {
    let currentCounter = nextOrderId;
    if (currentCounter >= 1_000_000) {
      let lastThreeDigits = (Time.now() % 1000 : Int).toNat();
      lastThreeDigits;
    } else {
      nextOrderId += 1;
      currentCounter;
    };
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

  // ── Order Submission (authenticated users only) ───────────────────────────

  /// Only authenticated users (role #user or #admin) may submit a service order.
  public shared ({ caller }) func submitOrder(
    customerId : Text,
    serviceName : Text,
    name : Text,
    mobile : Text,
    address : Text,
    documentKey : Text,
    amount : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit orders");
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

  /// Authenticated users may query their own orders.
  /// Admins may query any customer's orders.
  public query ({ caller }) func getOrdersByCustomer(customerId : Text) : async [ServiceOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    // Non-admin users may only retrieve their own orders.
    // The customerId here is a mobile-number-based identifier stored in the order;
    // admins are allowed to query any customerId.
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Verify the caller's profile mobile matches the requested customerId.
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for caller");
        };
        case (?profile) {
          if (profile.mobile != customerId) {
            Runtime.trap("Unauthorized: You can only view your own orders");
          };
        };
      };
    };
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

  // ── Payment Confirmation (admin only) ─────────────────────────────────────

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

  /// Authenticated users may check the payment confirmation for their own order.
  /// Admins may check any order's confirmation.
  public query ({ caller }) func getPaymentConfirmation(orderId : Nat) : async ?PaymentConfirmation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check payment confirmations");
    };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Ensure the order belongs to the caller.
      switch (serviceOrders.get(orderId)) {
        case (null) { Runtime.trap("Order not found") };
        case (?order) {
          switch (userProfiles.get(caller)) {
            case (null) { Runtime.trap("Unauthorized: No profile found for caller") };
            case (?profile) {
              if (profile.mobile != order.customerId) {
                Runtime.trap("Unauthorized: You can only check your own order's payment");
              };
            };
          };
        };
      };
    };
    paymentConfirmations.get(orderId);
  };
};
