export type OrderStatus = 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'ENTREGADO';

export interface Order {
  id: number;
  userId: number;
  username: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  serviceId: number;
  quantity: number;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: OrderStatus;
}
