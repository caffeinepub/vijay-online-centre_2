import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

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

  func getNextId() : Nat {
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUserRole(caller, #user);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller == user) {
      return userProfiles.get(user);
    };
    checkAdminRole(caller);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUserRole(caller, #user);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller = _ }) func registerCustomer(
    name : Text,
    mobile : Text,
    password : Text,
  ) : async () {
    if (customers.containsKey(mobile)) {
      Runtime.trap("Customer already exists");
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
  ) : async Nat {
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Customer does not exist");
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
      photoDataBase64;
      documentDataBase64;
      status = "Form Submitted";
      amount;
    };
    serviceOrders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getAllOrders() : async [ServiceOrder] {
    checkAdminRole(caller);
    serviceOrders.values().toArray();
  };

  public query ({ caller = _ }) func getOrdersByCustomer(customerId : Text) : async [ServiceOrder] {
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?_) {};
    };
    serviceOrders.values().toArray().filter(func(order : ServiceOrder) : Bool {
      order.customerId == customerId;
    });
  };

  public query ({ caller = _ }) func getOrderById(orderId : Nat) : async ?ServiceOrder {
    serviceOrders.get(orderId);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    checkAdminRole(caller);
    switch (serviceOrders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : ServiceOrder = { order with status };
        serviceOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func setPermQR(base64 : Text, autoAmount : Nat) : async () {
    checkAdminRole(caller);
    adminQRSettings := ?{
      permanentQrKey = base64;
      autoQrAmount = autoAmount;
    };
  };

  public query ({ caller = _ }) func getPermQR() : async Text {
    switch (adminQRSettings) {
      case (null) { "" };
      case (?settings) { settings.permanentQrKey };
    };
  };

  public query ({ caller = _ }) func getQRSettings() : async ?AdminQRSettings {
    adminQRSettings;
  };

  func checkAdminRole(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func checkUserRole(caller : Principal, requiredRole : AccessControl.UserRole) {
    if (not (AccessControl.hasPermission(accessControlState, caller, requiredRole))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };
};
