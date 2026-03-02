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

  public type ServiceOrder = {
    orderId : Nat;
    customerId : Text;
    serviceName : Text;
    name : Text;
    mobile : Text;
    address : Text;
    photoDataBase64 : Text;
    documentDataBase64 : Text;
    status : Text;
    amount : Nat;
    timestamp : Nat64;
  };

  public type AdminQRSettings = {
    permanentQrKey : Text;
    autoQrAmount : Nat;
  };

  let customers = Map.empty<Text, Customer>();
  let serviceOrders = Map.empty<Nat, ServiceOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextOrderId = 1;
  var adminQRSettings : ?AdminQRSettings = null;
  var lastOrderTimestamp : Nat64 = 0;

  func getNextId() : Nat {
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
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

  public shared ({ caller = _ }) func registerCustomer(
    name : Text,
    mobile : Text,
    password : Text,
  ) : async () {
    if (customers.containsKey(mobile)) {
      return;
    };
    let newCustomer : Customer = { name; mobile; password };
    customers.add(mobile, newCustomer);
  };

  public shared ({ caller = _ }) func loginCustomer(mobile : Text, password : Text) : async Bool {
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
    amount : Nat,
    timestamp : Nat64,
  ) : async Nat {
    let orderId = getNextId();
    let newOrder : ServiceOrder = {
      orderId;
      customerId;
      serviceName;
      name;
      mobile;
      address;
      photoDataBase64;
      documentDataBase64;
      status = "Pending";
      amount;
      timestamp;
    };
    serviceOrders.add(orderId, newOrder);
    lastOrderTimestamp := timestamp;
    orderId;
  };

  func compareNat64Descending(a : Nat64, b : Nat64) : Order.Order {
    Nat64.compare(b, a);
  };

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

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (serviceOrders.get(orderId)) {
      case (null) { return };
      case (?order) {
        let updatedOrder : ServiceOrder = { order with status };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func setPermQR(base64 : Text, autoAmount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set QR settings");
    };
    adminQRSettings := ?{
      permanentQrKey = base64;
      autoQrAmount = autoAmount;
    };
  };

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

  public query ({ caller = _ }) func getPermQR() : async Text {
    switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
  };

  public query ({ caller }) func getQRSettings() : async ?AdminQRSettings {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view QR settings");
    };
    adminQRSettings;
  };

  public query ({ caller }) func getLastOrderTimestamp() : async Nat64 {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view timestamp");
    };
    lastOrderTimestamp;
  };
};
