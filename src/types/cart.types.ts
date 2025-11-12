// Cart Types
export interface CartItem {
  id: string;
  userId: string;
  artworkId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  artwork?: any;
}

export interface CartListResponse {
  success: boolean;
  items: CartItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CartSummary {
  success: boolean;
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

export interface AddToCartDto {
  artworkId: string;
  quantity?: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

