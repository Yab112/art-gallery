import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

interface AuthLayoutProps {
    children: ReactNode
    onClose?: () => void
}

export function AuthLayout({ children, onClose }: AuthLayoutProps) {
    const navigate = useNavigate()

    const handleClose = () => {
        if (onClose) {
            onClose()
        }
        navigate("/")
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex max-h-[90vh] min-h-[min(600px,85vh)]">
                    {/* Left side - Gradient background with organic shapes */}
                    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-orange-300" />

                        {/* Organic curved shapes */}
                        <div className="absolute inset-0">
                            <div className="-translate-x-32 -translate-y-32 absolute top-0 left-0 h-96 w-96 transform rounded-full bg-gradient-to-br from-purple-400/30 to-transparent" />
                            <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-24 translate-y-24 transform rounded-full bg-gradient-to-tl from-orange-400/30 to-transparent" />
                            <div className="-translate-y-1/2 absolute top-1/2 left-1/4 h-64 w-64 transform rounded-full bg-gradient-to-r from-purple-300/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex w-full items-center justify-center p-12">
                            <div className="space-y-8 text-center text-white">
                                {/* Main Logo */}
                                <div className="mx-auto h-12 w-12">
                                    <img
                                        src="/mainlogo.png"
                                        alt="Logo"
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                {/* Welcome text */}
                                <div className="space-y-4">
                                    <h1 className="font-bold text-6xl leading-tight tracking-tight">
                                        Welcome
                                        <br />
                                        Back!
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Auth forms */}
                    <div className="relative flex flex-1 items-start justify-center overflow-y-auto bg-gray-50 p-8 pt-12">
                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <div className="my-auto w-full max-w-md">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
