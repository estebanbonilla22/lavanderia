export interface LaundryService {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationHours: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaundryServiceRequest {
  name: string;
  description?: string;
  price: number;
  durationHours: number;
  active?: boolean;
}
