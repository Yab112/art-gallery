import useMutationFunc from "@/hooks/use-mutation"
import { toast } from "sonner"

interface SendMessageResponse {
    message: string
    statusCode: number
    data: {
        message: string
        phone: string
    }
}

export const useSendMessage = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        SendMessageResponse,
        { message: string; phone: string }
    >({
        onSuccess: () => {
            toast.success("SMS sent successfully")
        },
        onError: (error) => {
            toast.error(`Send message failed: ${error?.message || "An unexpected error occurred"}`)
        },
        queryKey: ["send-message-to-user"]
    })

    const sendMessage = async (message: string, phone: string) => {
        return mutateAsync({
            url: "/sms/send",
            method: "POST",
            body: { message, phone }
        })
    }

    return {
        sendMessage,
        isSending: isPending
    }
}
