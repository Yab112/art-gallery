import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import { BearerTokenBootstrap } from "./components/auth/bearer-token-bootstrap"
import { DataPrefetcher } from "./components/data-prefetcher"
import { router } from "./routes"

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    }
})

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <DataPrefetcher />
            <BearerTokenBootstrap />
            {/* <DefaultMetadata /> */}
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    )
}
