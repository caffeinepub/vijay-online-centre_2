import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { AdminQRSettings, ServiceOrder, UserProfile } from "../backend";
import { useActor } from "./useActor";

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Admin Auth ────────────────────────────────────────────────────────────────

export function useAdminLogin() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  return useMutation({
    mutationFn: async ({
      userId,
      password,
    }: { userId: string; password: string }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.adminLogin(userId, password);
    },
  });
}

// ── Customer Auth ─────────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  return useMutation({
    mutationFn: async ({
      name,
      mobile,
      password,
    }: { name: string; mobile: string; password: string }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.registerCustomer(name, mobile, password);
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  return useMutation({
    mutationFn: async ({
      mobile,
      password,
    }: { mobile: string; password: string }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.loginCustomer(mobile, password);
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrdersPublic();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });
}

// ── Public (no-auth) variants ─────────────────────────────────────────────────

export function useGetAllOrdersPublic() {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrdersPublic();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetOrdersByCustomerPublic(customerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ["customerOrders", customerId],
    queryFn: async () => {
      if (!actor || !customerId) return [];
      return actor.getOrdersByCustomerPublic(customerId);
    },
    enabled: !!actor && !isFetching && !!customerId,
    retry: false,
    staleTime: 0,
  });
}

export function useGetOrderByIdPublic(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder | null>({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      return actor.getOrderByIdPublic(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    retry: false,
  });
}

export function useGetQRSettingsPublic() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminQRSettings | null>({
    queryKey: ["qrSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getQRSettingsPublic();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useGetOrdersByCustomer(customerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ["customerOrders", customerId],
    queryFn: async () => {
      if (!actor || !customerId) return [];
      return actor.getOrdersByCustomerPublic(customerId);
    },
    enabled: !!actor && !isFetching && !!customerId,
    retry: false,
    staleTime: 0,
  });
}

export function useGetOrderById(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder | null>({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      return actor.getOrderByIdPublic(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    retry: false,
  });
}

export function useGetOrderByTrackingId(trackingId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder | null>({
    queryKey: ["orderByTracking", trackingId],
    queryFn: async () => {
      if (!actor || !trackingId) return null;
      return actor.getOrderByTrackingId(trackingId);
    },
    enabled: !!actor && !isFetching && !!trackingId,
    refetchInterval: 10000,
    staleTime: 0,
  });
}

export function useSubmitOrder() {
  const { actor, isFetching: actorFetching } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: {
      customerId: string;
      serviceName: string;
      name: string;
      mobile: string;
      address: string;
      photoDataBase64: string;
      documentDataBase64: string;
      timestamp: bigint;
    }) => {
      const a = actorRef.current;
      if (!a)
        throw new Error("Actor not available. Please wait and try again.");
      return a.submitOrder(
        params.customerId,
        params.serviceName,
        params.name,
        params.mobile,
        params.address,
        params.photoDataBase64,
        params.documentDataBase64,
        params.timestamp,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
    },
  });

  return { ...mutation, isActorReady: !!actor && !actorFetching };
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: { orderId: bigint; newStatus: string }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orderByTracking"] });
    },
  });
}

// ── QR Settings ───────────────────────────────────────────────────────────────

export function useGetPermQR() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["permQR"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getPermQR();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQRSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminQRSettings | null>({
    queryKey: ["qrSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getQRSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPermQR() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      base64,
      autoAmount,
    }: { base64: string; autoAmount: bigint }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.setPermQR(base64, autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permQR"] });
      queryClient.invalidateQueries({ queryKey: ["qrSettings"] });
    },
  });
}

export function useSetAutoQRAmount() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (autoAmount: bigint) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.setAutoQRAmount(autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrSettings"] });
    },
  });
}

export function useUpdateOrderAmount() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      amount,
    }: { orderId: bigint; amount: bigint }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.updateOrderAmount(orderId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useGetLastOrderTimestamp() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["lastOrderTimestamp"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getLastOrderTimestamp();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// ── Mark Order Paid ───────────────────────────────────────────────────────────

export function useMarkOrderPaid() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.markOrderPaid(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orderByTracking"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

// ── Upload Order Receipt ──────────────────────────────────────────────────────

export function useUploadOrderReceipt() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      receiptUrl,
    }: { orderId: bigint; receiptUrl: string }) => {
      const a = actorRef.current;
      if (!a) throw new Error("Actor not available");
      return a.uploadOrderReceipt(orderId, receiptUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
    },
  });
}
