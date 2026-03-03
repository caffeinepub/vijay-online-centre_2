import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderStatus {
    readyForPickup?: bigint;
    completed?: bigint;
    orderPlaced?: bigint;
    inProcess?: bigint;
}
export interface ServiceOrder {
    serviceName: string;
    paymentStatus: string;
    receiptUrl: string;
    name: string;
    trackingId: string;
    documentDataBase64: string;
    statusHistory: OrderStatus;
    photoDataBase64: string;
    orderId: bigint;
    address: string;
    timestamp: bigint;
    customerId: string;
    mobile: string;
    amount: bigint;
    currentStatus: string;
}
export interface AdminQRSettings {
    autoQrAmount: bigint;
    permanentQrKey: string;
}
export interface UserProfile {
    name: string;
    mobile: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(userId: string, password: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrdersPublic(): Promise<Array<ServiceOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLastOrderTimestamp(): Promise<bigint>;
    getOrderByIdPublic(orderId: bigint): Promise<ServiceOrder | null>;
    getOrderByTrackingId(trackingId: string): Promise<ServiceOrder | null>;
    getOrdersByCustomerPublic(customerId: string): Promise<Array<ServiceOrder>>;
    getPermQR(): Promise<string>;
    getQRSettings(): Promise<AdminQRSettings | null>;
    getQRSettingsPublic(): Promise<AdminQRSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginCustomer(mobile: string, password: string): Promise<boolean>;
    markOrderPaid(orderId: bigint): Promise<void>;
    registerCustomer(name: string, mobile: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAutoQRAmount(autoAmount: bigint): Promise<void>;
    setPermQR(base64: string, autoAmount: bigint): Promise<void>;
    submitOrder(customerId: string, serviceName: string, name: string, mobile: string, address: string, photoDataBase64: string, documentDataBase64: string, timestamp: bigint): Promise<bigint>;
    updateOrderAmount(orderId: bigint, amount: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
    uploadOrderReceipt(orderId: bigint, receiptUrl: string): Promise<void>;
}
