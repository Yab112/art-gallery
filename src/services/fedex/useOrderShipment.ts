import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"
import type { OrderShipment } from "@/queries/orderQueries"

/**
 * Fetches the shipment(s) for a specific order (buyer perspective).
 * Polls every 5 minutes so the buyer's tracking page stays up to date.
 */
export const useOrderShipment = (orderId: string | undefined) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<OrderShipment[]>({
        queryKey: ["order-shipment", orderId],
        queryFn: async () => {
            if (!orderId) return []
            const response = await axiosAuth.get<OrderShipment[]>(
                `fedex/shipments/${orderId}`
            )
            return Array.isArray(response.data) ? response.data : []
        },
        enabled: !!orderId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // auto-poll every 5 minutes
        retry: 1,
    })
}

/**
 * Fetches tracking events for a given shipment.
 * The data is normally embedded inside the shipment object itself,
 * so this hook is a thin wrapper around useOrderShipment that extracts
 * the events for the first shipment matching the given artistId.
 */
export const useTrackingEvents = (
    orderId: string | undefined,
    artistId?: string
) => {
    const { data: shipments = [], ...rest } = useOrderShipment(orderId)

    const shipment = artistId
        ? shipments.find((s) => s.artistId === artistId)
        : shipments[0]

    return {
        shipment,
        events: shipment?.events ?? [],
        ...rest,
    }
}
