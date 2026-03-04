import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = { name : Text; mobile : Text };
  public type Customer = { name : Text; mobile : Text; password : Text };
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
    paymentStatus : Text;
    amount : Nat;
    timestamp : Nat64;
    statusHistory : OrderStatus;
    trackingId : Text;
    receiptUrl : Text;
  };
  public type AdminQRSettings = { permanentQrKey : Text; autoQrAmount : Nat };
  public type AdminCredentials = { userId : Text; password : Text; role : { #admin : () } };

  let customers = Map.empty<Text, Customer>();
  let serviceOrders = Map.empty<Nat, ServiceOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextOrderId = 1;
  var adminQRSettings : ?AdminQRSettings = null;
  var lastOrderTimestamp : Nat64 = 0;

  let adminUser : AdminCredentials = { userId = "vijay@123"; password = "Vijay@2026"; role = #admin };

  func getNextId() : Nat {
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  func generateTrackingId(orderId : Nat) : Text {
    let suffix = (orderId * 73) % 100;
    "TRACK" # orderId.toText() # suffix.toText();
  };

  public shared ({ caller }) func adminLogin(userId : Text, password : Text) : async Bool {
    if (userId == adminUser.userId and password == adminUser.password) {
      AccessControl.initialize(accessControlState, caller, "", "");
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller = _ }) func registerCustomer(name : Text, mobile : Text, password : Text) : async () {
    if (customers.containsKey(mobile)) {
      Runtime.trap("Customer with this mobile number already exists");
    };
    let newCustomer : Customer = { name; mobile; password };
    customers.add(mobile, newCustomer);
  };

  public query ({ caller = _ }) func loginCustomer(mobile : Text, password : Text) : async Bool {
    switch (customers.get(mobile)) {
      case (null) { false };
      case (?customer) { customer.password == password };
    };
  };

  public shared ({ caller = _ }) func submitOrder(
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
      paymentStatus = "Pending";
      amount = 0;
      timestamp;
      statusHistory = initialStatus;
      trackingId;
      receiptUrl = "";
    };

    serviceOrders.add(orderId, newOrder);
    lastOrderTimestamp := timestamp;
    orderId;
  };

  func compareNat64Descending(a : Nat64, b : Nat64) : Order.Order {
    Nat64.compare(b, a);
  };

  public query ({ caller = _ }) func getAllOrdersPublic() : async [ServiceOrder] {
    serviceOrders.values().toArray().sort(
      func(a, b) {
        compareNat64Descending(a.timestamp, b.timestamp);
      }
    );
  };

  public query ({ caller = _ }) func getOrdersByCustomerPublic(customerId : Text) : async [ServiceOrder] {
    serviceOrders.values().toArray().sort(
      func(a, b) {
        compareNat64Descending(a.timestamp, b.timestamp);
      }
    ).filter(
      func(order : ServiceOrder) : Bool {
        order.customerId == customerId;
      }
    );
  };

  public query ({ caller = _ }) func getOrderByIdPublic(orderId : Nat) : async ?ServiceOrder {
    serviceOrders.get(orderId);
  };

  public query ({ caller = _ }) func getOrderByTrackingId(trackingId : Text) : async ?ServiceOrder {
    serviceOrders.values().toArray().find(func(order) { order.trackingId == trackingId });
  };

  public shared ({ caller = _ }) func markOrderPaid(orderId : Nat) : async () {
    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));
        let updatedStatus = { order.statusHistory with inProcess = ?currentTime };

        let updatedOrder : ServiceOrder = { order with paymentStatus = "Paid"; currentStatus = "In Process"; statusHistory = updatedStatus };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller = _ }) func uploadOrderReceipt(orderId : Nat, receiptUrl : Text) : async () {
    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = { order with receiptUrl = receiptUrl };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));

        let updatedStatusHistory = switch (newStatus) {
          case ("Order Placed") { { order.statusHistory with orderPlaced = ?currentTime } };
          case ("In Process") { { order.statusHistory with inProcess = ?currentTime } };
          case ("Ready for Pickup") { { order.statusHistory with readyForPickup = ?currentTime } };
          case ("Completed") { { order.statusHistory with completed = ?currentTime } };
          case (_) { order.statusHistory };
        };

        let updatedOrder : ServiceOrder = { order with currentStatus = newStatus; statusHistory = updatedStatusHistory };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateOrderAmount(orderId : Nat, amount : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order amount");
    };

    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = { order with amount = amount };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller = _ }) func setPermQR(base64 : Text, autoAmount : Nat) : async () {
    adminQRSettings := ?{ permanentQrKey = base64; autoQrAmount = autoAmount };
  };

  public shared ({ caller = _ }) func setAutoQRAmount(autoAmount : Nat) : async () {
    let currentQrKey = switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
    adminQRSettings := ?{ permanentQrKey = currentQrKey; autoQrAmount = autoAmount };
  };

  public query ({ caller = _ }) func getPermQR() : async Text {
    switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
  };

  public query ({ caller = _ }) func getQRSettingsPublic() : async ?AdminQRSettings {
    adminQRSettings;
  };

  public query ({ caller = _ }) func getQRSettings() : async ?AdminQRSettings {
    adminQRSettings;
  };

  public query ({ caller = _ }) func getLastOrderTimestamp() : async Nat64 {
    lastOrderTimestamp;
  };
};
