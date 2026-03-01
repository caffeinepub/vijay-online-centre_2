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
    documentKey: string;
    name: string;
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
export interface PaymentConfirmation {
    orderId: bigint;
    timestamp: bigint;
    confirmedByAdmin: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Admin-only: confirm that a payment has been received for an order,
     * / and advance the order status to 'Payment Completed'.
     */
    confirmPayment(orderId: bigint): Promise<void>;
    /**
     * / Admin-only: retrieve all submitted orders.
     */
    getAllOrders(): Promise<Array<ServiceOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Authenticated users may query their own orders.
     * / Admins may query any customer's orders.
     */
    getOrdersByCustomer(customerId: string): Promise<Array<ServiceOrder>>;
    /**
     * / Authenticated users may check the payment confirmation for their own order.
     * / Admins may check any order's confirmation.
     */
    getPaymentConfirmation(orderId: bigint): Promise<PaymentConfirmation | null>;
    /**
     * / Anyone may retrieve the permanent QR image (needed to display payment QR to customers).
     */
    getPermQR(): Promise<string>;
    /**
     * / Anyone may retrieve the full QR settings (amount needed for auto-QR generation).
     */
    getQRSettings(): Promise<AdminQRSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Anyone (including guests) may attempt to log in.
     */
    loginCustomer(mobile: string, password: string): Promise<boolean>;
    /**
     * / Anyone (including guests) may register a new customer account.
     */
    registerCustomer(name: string, mobile: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Admin-only: set the permanent QR image and/or auto-QR amount.
     */
    setPermQR(base64: string, autoAmount: bigint): Promise<void>;
    /**
     * / Only authenticated users (role #user or #admin) may submit a service order.
     */
    submitOrder(customerId: string, serviceName: string, name: string, mobile: string, address: string, documentKey: string, amount: bigint): Promise<bigint>;
    /**
     * / Admin-only: update the status of a service order.
     */
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
}
