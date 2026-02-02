import { getApiBaseUrl } from "@/lib/api-config"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export interface OrderItem {
    artworkId: string
    quantity: number
    price: number
}

export interface ShippingAddress {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country?: string
}

export interface CreateOrderParams {
    buyerEmail: string
    shippingAddress: ShippingAddress
    paymentMethod: "chapa" | "paypal" | "card"
    items: OrderItem[]
}

export interface CreateOrderResponse {
    success: boolean
    message: string
    data: {
        orderId: string
        txRef: string
        totalAmount: number
        subtotal: number
        platformFee: number
    }
}

const createOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
    try {
        const response = await axios.post(`${getApiBaseUrl()}/api/orders/create`, params, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        })

        // If response has success field, use it; otherwise assume success
        if (response.data && typeof response.data === "object") {
            if ("success" in response.data && !response.data.success) {
                throw new Error(response.data.message || "Failed to create order")
            }
            // If response has orderId or data field, it's the order data
            if ("orderId" in response.data || "data" in response.data) {
                return {
                    success: true,
                    message: response.data.message || "Order created successfully",
                    data: response.data.data || response.data
                }
            }
        }

        return {
            success: true,
            message: "Order created successfully",
            data: response.data
        }
    } catch (error: any) {
        // Extract error message from response
        let errorMessage = "Failed to create order"

        if (error?.response?.data) {
            const errorData = error.response.data

            // Handle NestJS validation errors
            if (Array.isArray(errorData.message)) {
                errorMessage = errorData.message
                    .map((msg: any) => {
                        if (typeof msg === "string") return msg
                        if (msg?.constraints) {
                            return Object.values(msg.constraints).join(", ")
                        }
                        return JSON.stringify(msg)
                    })
                    .join(", ")
            } else if (errorData.message) {
                errorMessage = errorData.message
            } else if (errorData.error) {
                errorMessage = errorData.error
            } else if (typeof errorData === "string") {
                errorMessage = errorData
            }
        } else if (error?.message) {
            errorMessage = error.message
        }

        console.error("Order creation error details:", {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: errorMessage,
            requestData: params
        })

        throw new Error(errorMessage)
    }
}

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            console.log("Order created successfully:", data)
        },
        onError: (error: any) => {
            console.error("Order creation failed:", error)
        }
    })
}
