import { useMutation } from "@tanstack/react-query"
import { api } from "@/hooks/use-axios-auth"
import { ShippingOption } from "@/contexts/CheckoutContext"

interface FetchRatesData {
  recipientAddress: {
    city: string
    state: string
    zipCode: string
    country: string
  }
  cartItemIds: string[]
}

interface RatesResponse {
  success: boolean
  rates: ShippingOption[]
}

export const useFedExRates = () => {
  return useMutation({
    mutationFn: async (data: FetchRatesData) => {
      console.log("FedEx Rates Payload:", JSON.stringify(data, null, 2))
      const response = await api.post<RatesResponse>("/fedex/rates", data)
      return response.data
    }
  })
}
