import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface OrderItem {
    id: string
    orderId: string
    artworkId: string
    quantity: number
    price: number
    artwork?: {
        id: string
        userId?: string
        title?: string
        artist?: string
        photos?: string[]
        desiredPrice?: number
        user?: {
            id: string
            name?: string
            email?: string
        }
    }
}

export interface ShipmentEvent {
    id: string
    shipmentId: string
    status: string
    description: string
    location?: string | null
    timestamp: string
    createdAt: string
}

export interface OrderShipment {
    id: string
    orderId: string
    artistId: string
    trackingNumber?: string | null
    masterTrackingId?: string | null
    labelUrl?: string | null
    serviceType: string
    status: string
    failureReason?: string | null
    estimatedDelivery?: string | null
    createdAt: string
    updatedAt: string
    events?: ShipmentEvent[]
}

export interface DeliveryConfirmationSummary {
    id: string
    orderId: string
    hasDispute: boolean
    disputeReason?: string | null
    disputeNote?: string | null
    confirmedAt: string
}

export interface Order {
    id: string
    buyerEmail: string
    totalAmount: number | string
    status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "DISPUTED"
    createdAt: string
    updatedAt: string
    items: OrderItem[]
    transaction?: {
        id: string
        status: string
        amount: number | string
        metadata?: any
    }
    shipments?: OrderShipment[]
    deliveryConfirmation?: DeliveryConfirmationSummary | null
    dispute?: any
}

export interface OrdersResponse {
    orders: Order[]
    pagination?: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

/**
 * Get authenticated user's orders
 * Uses the secure endpoint that fetches orders by authenticated user ID
 */
export const useUserOrders = () => {
    const axiosAuth = useAxiosAuth()

    return useQuery<Order[]>({
        queryKey: ["user-orders"],
        queryFn: async () => {
            try {
                console.log("Fetching orders for authenticated user")
                const response = await axiosAuth.get<Order[]>("orders/my-orders")

                console.log("Orders API response:", response.data)

                // Backend returns array directly
                if (Array.isArray(response.data)) {
                    console.log(`Found ${response.data.length} orders`)
                    return response.data
                }

                // If wrapped in data property
                if (response.data && typeof response.data === "object" && "data" in response.data) {
                    const data = (response.data as any).data
                    if (Array.isArray(data)) {
                        console.log(`Found ${data.length} orders in data property`)
                        return data
                    }
                }

                // If wrapped in orders property
                if (
                    response.data &&
                    typeof response.data === "object" &&
                    "orders" in response.data
                ) {
                    const orders = (response.data as any).orders
                    if (Array.isArray(orders)) {
                        console.log(`Found ${orders.length} orders in orders property`)
                        return orders
                    }
                }

                console.warn("Orders response format unexpected:", response.data)
                return []
            } catch (error: any) {
                console.error("Failed to fetch orders:", error)
                console.error("Error details:", {
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status
                })
                // Return empty array on error instead of throwing
                return []
            }
        },
        staleTime: 0, // Always consider data stale - refetch on mount
        refetchOnMount: true, // Refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
        retry: 2
    })
}

export const useOrder = (id?: string) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<Order>({
        queryKey: ["order", id],
        queryFn: async () => {
            if (!id) throw new Error("Order ID is required")
            
            // Re-using the my-orders endpoint and finding it locally
            // since we don't have a single order endpoint yet in the controller,
            // or if we do, we can call it. Let's assume we can call my-orders and filter.
            const response = await axiosAuth.get<Order[]>("orders/my-orders")
            
            let orders: Order[] = []
            if (Array.isArray(response.data)) {
                orders = response.data
            } else if (response.data && typeof response.data === "object" && "data" in response.data) {
                orders = (response.data as any).data
            } else if (response.data && typeof response.data === "object" && "orders" in response.data) {
                orders = (response.data as any).orders
            }

            const order = orders.find(o => o.id === id)
            if (!order) {
                throw new Error("Order not found")
            }
            return order
        },
        enabled: !!id,
    })
}
