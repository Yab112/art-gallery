import { buttonVariants } from "@/components/ui/button"
import { NavLink } from "react-router-dom"

export default function NoMatch() {
    return (
        <div className=" flex min-h-[calc(100vh-80px)] flex-grow items-center justify-center text-black">
            <div className="space-y-4">
                <h2 className="mb-4 text-8xl">404</h2>
                <h1 className="font-semibold text-3xl">Oops! Page not found</h1>
                <p className="text-muted-foreground text-sm">
                    We are sorry, but the page you requested was not found
                </p>
                <NavLink to="/" className={buttonVariants({ variant: "outline" })}>
                    Back to Home
                </NavLink>
            </div>
        </div>
    )
}
