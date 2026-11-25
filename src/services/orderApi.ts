import type { Order, OrderInput, OrderStatus } from '@/domain/order';
import { apiRequest } from '@/lib/api/http';

export const orderApi = {
  async place(input: OrderInput): Promise<Order> {
    return (await apiRequest<{ order: Order }>('/orders', { method: 'POST', json: input })).order;
  },

  async mine(): Promise<Order[]> {
    return (await apiRequest<{ orders: Order[] }>('/orders/mine')).orders;
  },

  async all(): Promise<Order[]> {
    return (await apiRequest<{ orders: Order[] }>('/orders')).orders;
  },

  async setStatus(id: string, status: OrderStatus): Promise<Order> {
    return (await apiRequest<{ order: Order }>(`/orders/${id}`, { method: 'PATCH', json: { status } })).order;
  },
};
