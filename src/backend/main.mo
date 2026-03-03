import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    mobile : Text;
  };

  public type Customer = {
    name : Text;
    mobile : Text;
    password : Text;
  };

  public type OrderStatus = {
    orderPlaced : ?Nat64;
    inProcess : ?Nat64;
    readyForPickup : ?Nat64;
    completed : ?Nat64;
  };

  public type ServiceOrder = {
    orderId : Nat;
    customerId : Text;
    serviceName : Text;
    name : Text;
    mobile : Text;
    address : Text;
    photoDataBase64 : Text;
    documentDataBase64 : Text;
    currentStatus : Text;
    amount : Nat;
    timestamp : Nat64;
    statusHistory : OrderStatus;
    trackingId : Text;
  };

  public type AdminQRSettings = {
    permanentQrKey : Text;
    autoQrAmount : Nat;
  };

  public type AdminCredentials = {
    userId : Text;
    password : Text;
    role : { #admin : () };
  };

  let customers = Map.empty<Text, Customer>();
  let serviceOrders = Map.empty<Nat, ServiceOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextOrderId = 1;
  var adminQRSettings : ?AdminQRSettings = null;
  var lastOrderTimestamp : Nat64 = 0;

  let adminUser : AdminCredentials = {
    userId = "vijay@123";
    password = "vijay@123";
    role = #admin;
  };

  func getNextId() : Nat {
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  func generateTrackingId(orderId : Nat) : Text {
    let suffix = (orderId * 73) % 100;
    "TRACK" # orderId.toText() # suffix.toText();
  };

  // Admin login: verifies hardcoded credentials and grants admin role to caller's principal
  public shared ({ caller }) func adminLogin(userId : Text, password : Text) : async Bool {
    if (userId == adminUser.userId and password == adminUser.password) {
      // Provide empty tokens for legacy compatibility
      AccessControl.initialize(accessControlState, caller, "", "");
      true;
    } else {
      false;
    };
  };

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

  // Customer registration - open to anyone (no auth required)
  public shared ({ caller }) func registerCustomer(
    name : Text,
    mobile : Text,
    password : Text,
  ) : async () {
    if (customers.containsKey(mobile)) {
      Runtime.trap("Customer with this mobile number already exists");
    };
    let newCustomer : Customer = { name; mobile; password };
    customers.add(mobile, newCustomer);
  };

  // Customer login - open to anyone (no auth required)
  public shared ({ caller }) func loginCustomer(mobile : Text, password : Text) : async Bool {
    switch (customers.get(mobile)) {
      case (null) { false };
      case (?customer) { customer.password == password };
    };
  };

  // Submit order - open to any caller (customers may be anonymous or registered)
  public shared ({ caller }) func submitOrder(
    customerId : Text,
    serviceName : Text,
    name : Text,
    mobile : Text,
    address : Text,
    photoDataBase64 : Text,
    documentDataBase64 : Text,
    timestamp : Nat64,
  ) : async Nat {
    let orderId = getNextId();
    let trackingId = generateTrackingId(orderId);

    let initialStatus : OrderStatus = {
      orderPlaced = ?timestamp;
      inProcess = null;
      readyForPickup = null;
      completed = null;
    };

    let newOrder : ServiceOrder = {
      orderId;
      customerId;
      serviceName;
      name;
      mobile;
      address;
      photoDataBase64;
      documentDataBase64;
      currentStatus = "Order Placed";
      amount = 0;
      timestamp;
      statusHistory = initialStatus;
      trackingId;
    };

    serviceOrders.add(orderId, newOrder);
    lastOrderTimestamp := timestamp;
    orderId;
  };

  func compareNat64Descending(a : Nat64, b : Nat64) : Order.Order {
    Nat64.compare(b, a);
  };

  // Admin-only: view all orders
  public query ({ caller }) func getAllOrders() : async [ServiceOrder] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    serviceOrders.values().toArray().sort(
      func(a, b) {
        compareNat64Descending(a.timestamp, b.timestamp);
      }
    );
  };

  // Admin can view any customer's orders; users can only view their own
  public query ({ caller }) func getOrdersByCustomer(customerId : Text) : async [ServiceOrder] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Must be logged in to view orders");
      };
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for caller");
        };
        case (?profile) {
          if (profile.mobile != customerId) {
            Runtime.trap("Unauthorized: Can only view your own orders");
          };
        };
      };
    };
    serviceOrders.values().toArray().sort(
      func(a, b) {
        compareNat64Descending(a.timestamp, b.timestamp);
      }
    ).filter(func(order : ServiceOrder) : Bool { order.customerId == customerId });
  };

  // Admin can view any order; users can only view their own
  public query ({ caller }) func getOrderById(orderId : Nat) : async ?ServiceOrder {
    switch (serviceOrders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          return ?order;
        };
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
          Runtime.trap("Unauthorized: Must be logged in to view order details");
        };
        switch (userProfiles.get(caller)) {
          case (null) {
            Runtime.trap("Unauthorized: No profile found for caller");
          };
          case (?profile) {
            if (profile.mobile != order.customerId) {
              Runtime.trap("Unauthorized: Can only view your own orders");
            };
          };
        };
        ?order;
      };
    };
  };

  // Public tracking - anyone can look up by tracking ID
  public query ({ caller = _ }) func getOrderByTrackingId(trackingId : Text) : async ?ServiceOrder {
    serviceOrders.values().toArray().find(func(order) { order.trackingId == trackingId });
  };

  // Admin-only: update order status
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));

        let updatedStatusHistory = switch (newStatus) {
          case ("Order Placed") {
            { order.statusHistory with orderPlaced = ?currentTime };
          };
          case ("In Process") {
            { order.statusHistory with inProcess = ?currentTime };
          };
          case ("Ready for Pickup") {
            { order.statusHistory with readyForPickup = ?currentTime };
          };
          case ("Completed") {
            { order.statusHistory with completed = ?currentTime };
          };
          case (_) { order.statusHistory };
        };

        let updatedOrder : ServiceOrder = {
          order with
          currentStatus = newStatus;
          statusHistory = updatedStatusHistory;
        };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  // Admin-only: update order amount
  public shared ({ caller }) func updateOrderAmount(orderId : Nat, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order amount");
    };

    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = {
          order with amount = amount;
        };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  // Admin-only: set permanent QR and auto amount
  public shared ({ caller }) func setPermQR(base64 : Text, autoAmount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set QR settings");
    };
    adminQRSettings := ?{
      permanentQrKey = base64;
      autoQrAmount = autoAmount;
    };
  };

  // Admin-only: update auto QR amount
  public shared ({ caller }) func setAutoQRAmount(autoAmount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set auto QR amount");
    };
    let currentQrKey = switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
    adminQRSettings := ?{
      permanentQrKey = currentQrKey;
      autoQrAmount = autoAmount;
    };
  };

  // Public: anyone can fetch the permanent QR image
  public query ({ caller = _ }) func getPermQR() : async Text {
    switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
  };

  // Admin-only: view full QR settings including amount
  public query ({ caller }) func getQRSettings() : async ?AdminQRSettings {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view QR settings");
    };
    adminQRSettings;
  };

  // Admin-only: view last order timestamp
  public query ({ caller }) func getLastOrderTimestamp() : async Nat64 {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view timestamp");
    };
    lastOrderTimestamp;
  };
};
