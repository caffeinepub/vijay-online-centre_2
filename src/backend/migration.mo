import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";

module {
  type UserProfile = { name : Text; mobile : Text };
  type Customer = { name : Text; mobile : Text; password : Text };
  type OrderStatus = {
    orderPlaced : ?Nat64;
    inProcess : ?Nat64;
    readyForPickup : ?Nat64;
    completed : ?Nat64;
  };
  type ServiceOrder = {
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
  type AdminQRSettings = { permanentQrKey : Text; autoQrAmount : Nat };

  type OldActor = {
    customers : Map.Map<Text, Customer>;
    serviceOrders : Map.Map<Nat, ServiceOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextOrderId : Nat;
    adminQRSettings : ?AdminQRSettings;
    lastOrderTimestamp : Nat64;
  };

  type NewActor = {
    customers : Map.Map<Text, Customer>;
    serviceOrders : Map.Map<Nat, ServiceOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextOrderId : Nat;
    adminQRSettings : ?AdminQRSettings;
    lastOrderTimestamp : Nat64;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
