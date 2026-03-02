import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ServiceOrder, AdminQRSettings } from '../backend';

// ── Admin token helper ──────────────────────────────────────────────────────
// The caffeineAdminToken is embedded in the URL by the deployment system.
// We read it once and reuse it to grant admin access to the anonymous actor.
function getAdminToken(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('caffeineAdminToken') || null;
  } catch {
    return null;
  }
}

// Attempt to initialize admin access on the actor (best-effort, silent on failure)
async function tryInitAdminAccess(actor: any): Promise<void> {
  const token = getAdminToken();
  if (!token) return;
  try {
    if (typeof actor._initializeAccessControlWithSecret === 'function') {
      await actor._initializeAccessControlWithSecret(token);
    }
  } catch {
    // silent
  }
}

// ── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
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
    mutationFn: async (profile: { name: string; mobile: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Customer Auth ────────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { name: string; mobile: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerCustomer(params.name, params.mobile, params.password);
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { mobile: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.loginCustomer(params.mobile, params.password);
    },
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Ensure admin access is initialized before calling admin-only endpoint
        await tryInitAdminAccess(actor);
        const orders = await actor.getAllOrders();
        return orders;
      } catch (err: any) {
        console.error('getAllOrders error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    // Poll every 5 seconds so new customer submissions appear quickly
    refetchInterval: 5000,
    // Keep polling even when the browser tab is in the background
    refetchIntervalInBackground: true,
    // Immediately refetch when the admin switches back to this tab
    refetchOnWindowFocus: true,
    // Always treat data as stale so every poll fetches fresh data
    staleTime: 0,
    // Garbage collect immediately so no stale data is shown on remount
    gcTime: 0,
  });
}

export function useGetOrdersByCustomer(customerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['ordersByCustomer', customerId],
    queryFn: async () => {
      if (!actor || !customerId) return [];
      try {
        return await actor.getOrdersByCustomer(customerId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!customerId,
    refetchInterval: 15000,
    staleTime: 0,
  });
}

export function useGetOrderById(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder | null>({
    queryKey: ['orderById', orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      try {
        return await actor.getOrderById(orderId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 15000,
    staleTime: 0,
  });
}

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
      photoDataBase64: string;
      documentDataBase64: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now());
      return actor.submitOrder(
        params.customerId,
        params.serviceName,
        params.name,
        params.mobile,
        params.address,
        params.photoDataBase64,
        params.documentDataBase64,
        params.amount,
        timestamp,
      );
    },
    onSuccess: () => {
      // Invalidate both the admin orders list and the customer's own orders list
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await tryInitAdminAccess(actor);
      return actor.updateOrderStatus(params.orderId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

// ── QR Settings ──────────────────────────────────────────────────────────────

// Open to all — used by PaymentScreen (no auth required)
export function useGetPermQR() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['permQR'],
    queryFn: async () => {
      if (!actor) return '';
      try {
        return await actor.getPermQR();
      } catch {
        return '';
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

// Admin-only — used by AdminQRManagement
export function useGetQRSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminQRSettings | null>({
    queryKey: ['qrSettings'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        await tryInitAdminAccess(actor);
        return await actor.getQRSettings();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useSetPermQR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { base64: string; autoAmount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await tryInitAdminAccess(actor);
      return actor.setPermQR(params.base64, params.autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrSettings'] });
      queryClient.invalidateQueries({ queryKey: ['permQR'] });
    },
  });
}

export function useSetAutoQRAmount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (autoAmount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await tryInitAdminAccess(actor);
      return actor.setAutoQRAmount(autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrSettings'] });
      queryClient.invalidateQueries({ queryKey: ['permQR'] });
    },
  });
}

export function useGetLastOrderTimestamp() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['lastOrderTimestamp'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        await tryInitAdminAccess(actor);
        return await actor.getLastOrderTimestamp();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}
