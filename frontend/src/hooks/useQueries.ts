import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ServiceOrder, AdminQRSettings, UserProfile } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Customer Auth ─────────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, mobile, password }: { name: string; mobile: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerCustomer(name, mobile, password);
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ mobile, password }: { mobile: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.loginCustomer(mobile, password);
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useSubmitOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: string;
      serviceName: string;
      name: string;
      mobile: string;
      address: string;
      documentKey: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitOrder(
        params.customerId,
        params.serviceName,
        params.name,
        params.mobile,
        params.address,
        params.documentKey,
        params.amount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useGetOrdersByCustomer(customerId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByCustomer(customerId);
    },
    enabled: !!actor && !actorFetching && !!customerId,
    refetchInterval: 10000,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPayment(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ── QR Settings ───────────────────────────────────────────────────────────────

export function useGetQRSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminQRSettings>({
    queryKey: ['qrSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getQRSettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetPermQR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ base64, autoAmount }: { base64: string; autoAmount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPermQR(base64, autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrSettings'] });
    },
  });
}

// ── Role ──────────────────────────────────────────────────────────────────────

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: import('@icp-sdk/core/principal').Principal; role: import('../backend').UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
