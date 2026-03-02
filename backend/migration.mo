import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
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

  type OldActor = {
    customers : Map.Map<Text, Customer>;
    serviceOrders : Map.Map<Nat, ServiceOrder>;
    adminQRSettings : AdminQRSettings;
    paymentConfirmations : Map.Map<Nat, PaymentConfirmation>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextOrderId : Nat;
    nextDocumentId : Nat;
  };

  type NewActor = {
    customers : Map.Map<Text, Customer>;
    serviceOrders : Map.Map<Nat, ServiceOrder>;
    adminQRSettings : AdminQRSettings;
    paymentConfirmations : Map.Map<Nat, PaymentConfirmation>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let {
      customers;
      serviceOrders;
      adminQRSettings;
      paymentConfirmations;
      userProfiles;
      nextOrderId;
    } = old;
    {
      customers;
      serviceOrders;
      adminQRSettings;
      paymentConfirmations;
      userProfiles;
      nextOrderId;
    };
  };
};
