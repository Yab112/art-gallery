import useAxiosAuth from "@/hooks/use-axios-auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSellerReturnQueue() {
  const axiosAuth = useAxiosAuth()
  return useQuery({
    queryKey: ["disputes", "return-queue"],
    queryFn: async () => {
      const res = await axiosAuth.get("disputes/return-queue")
      return (res.data?.data ?? res.data) as { disputes: any[] }
    },
  })
}

export function useSellerDispute(disputeId?: string) {
  const axiosAuth = useAxiosAuth()
  return useQuery({
    queryKey: ["disputes", disputeId],
    enabled: !!disputeId,
    queryFn: async () => {
      const res = await axiosAuth.get(`disputes/${disputeId}`)
      return res.data?.data ?? res.data
    },
  })
}

export function useConfirmReturn() {
  const axiosAuth = useAxiosAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      disputeId: string
      signatureDataUrl: string
      note?: string
      photoDataUrls?: string[]
    }) => {
      const { disputeId, ...body } = params
      const res = await axiosAuth.post(`disputes/${disputeId}/confirm-return`, body)
      return res.data?.data ?? res.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["disputes", "return-queue"] })
      queryClient.invalidateQueries({ queryKey: ["disputes", vars.disputeId] })
      queryClient.invalidateQueries({ queryKey: ["fedex", "my-shipments"] })
    },
  })
}
