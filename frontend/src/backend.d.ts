import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceOrder {
    status: string;
    serviceName: string;
    name: string;
    documentDataBase64: string;
    photoDataBase64: string;
    orderId: bigint;
    address: string;
    timestamp: bigint;
    customerId: string;
    mobile: string;
    amount: bigint;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrders(): Promise<Array<ServiceOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLastOrderTimestamp(): Promise<bigint>;
    getOrderById(orderId: bigint): Promise<ServiceOrder | null>;
    getOrdersByCustomer(customerId: string): Promise<Array<ServiceOrder>>;
    getPermQR(): Promise<string>;
    getQRSettings(): Promise<AdminQRSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginCustomer(mobile: string, password: string): Promise<boolean>;
    registerCustomer(name: string, mobile: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAutoQRAmount(autoAmount: bigint): Promise<void>;
    setPermQR(base64: string, autoAmount: bigint): Promise<void>;
    submitOrder(customerId: string, serviceName: string, name: string, mobile: string, address: string, photoDataBase64: string, documentDataBase64: string, amount: bigint, timestamp: bigint): Promise<bigint>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
}
