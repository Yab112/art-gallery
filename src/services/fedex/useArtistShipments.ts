import { useFetchData } from "@/hooks/use-query"
import { api } from "@/hooks/use-axios-auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface ShipmentEvent {
    id: string
    status: string
    description: string
    location: string | null
    timestamp: string
}

export interface ArtistShipment {
    id: string
    orderId: string
    trackingNumber: string | null
    masterTrackingId: string | null
    labelUrl: string | null
    serviceType: string
    status: string
    failureReason?: string | null
    estimatedDelivery: string | null
    lastTrackingSyncAt?: string | null
    lastTrackingSyncError?: string | null
    createdAt: string
    order: {
        id: string
        totalAmount: number
        buyerEmail: string
        status: string
    }
    events: ShipmentEvent[]
}

export const useArtistShipments = () => {
    return useFetchData<ArtistShipment[]>(
        ["fedex", "my-shipments"],
        "fedex/my-shipments",
        { staleTime: 30000 }
    )
}

export const useRetryShipment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (shipmentId: string) => {
            const response = await api.post(`/fedex/shipments/${shipmentId}/retry`)
            return response.data
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["fedex", "my-shipments"] })
        },
    })
}

/** Pull latest FedEx Track for a shipment (Basic Integrated Visibility). */
export const useSyncShipmentTracking = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params: {
            shipmentId: string
            /** Sandbox-only: FedEx mock tracking number (still hits Track API). */
            mockTrackingNumber?: string
        }) => {
            const response = await api.post(
                `/fedex/shipments/${params.shipmentId}/sync-tracking`,
                params.mockTrackingNumber
                    ? { mockTrackingNumber: params.mockTrackingNumber }
                    : {},
            )
            return response.data
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["fedex", "my-shipments"] })
            // Buyer Orders page (`useOrderShipment` + embedded order.shipments)
            queryClient.invalidateQueries({ queryKey: ["order-shipment"] })
            queryClient.invalidateQueries({ queryKey: ["user-orders"] })
            queryClient.invalidateQueries({ queryKey: ["order"] })
        },
    })
}
