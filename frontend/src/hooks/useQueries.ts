import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ServiceOrder, AdminQRSettings } from '../backend';

// ─── Customer Auth ────────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, mobile, password }: { name: string; mobile: string; password: string }) => {
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      await actor.registerCustomer(name, mobile, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ mobile, password }: { mobile: string; password: string }) => {
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      return actor.loginCustomer(mobile, password);
    },
    retry: 1,
    retryDelay: 1000,
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const orders = await actor.getAllOrders();
        return orders;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // If unauthorized, return empty array instead of throwing to avoid breaking the UI
        if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('admin')) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetOrdersByCustomer(customerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ServiceOrder[]>({
    queryKey: ['customerOrders', customerId],
    queryFn: async () => {
      if (!actor || !customerId) return [];
      try {
        return await actor.getOrdersByCustomer(customerId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!customerId,
    retry: 1,
  });
}

export function useGetOrderById(orderId: string) {
  const { actor, isFetching } = useActor();
  const orderIdNum = orderId ? BigInt(orderId) : null;

  return useQuery<ServiceOrder | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor || !orderIdNum) return null;
      try {
        return await actor.getOrderById(orderIdNum);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!orderIdNum,
    retry: 1,
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
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      const orderId = await actor.submitOrder(
        params.customerId,
        params.serviceName,
        params.name,
        params.mobile,
        params.address,
        params.photoDataBase64,
        params.documentDataBase64,
        params.amount,
      );
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
    retry: 1,
    retryDelay: 1500,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      await actor.updateOrderStatus(params.orderId, params.status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
    retry: 0,
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: bigint }) => {
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      await actor.updateOrderStatus(params.orderId, 'Payment Confirmed');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
    },
    retry: 0,
  });
}

// ─── QR Settings ──────────────────────────────────────────────────────────────

export function useGetQRSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminQRSettings | null>({
    queryKey: ['qrSettings'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getQRSettings();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

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
    retry: 1,
  });
}

export function useSetPermQR() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { base64: string; autoAmount: bigint }) => {
      if (!actor) throw new Error('Service not available. Please wait and try again.');
      await actor.setPermQR(params.base64, params.autoAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrSettings'] });
      queryClient.invalidateQueries({ queryKey: ['permQR'] });
    },
    retry: 0,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

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
