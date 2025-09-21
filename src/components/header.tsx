import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <span>💡</span>
              <span className="text-sm">How it works</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <nav className="flex items-center gap-6">
                <span className="font-medium text-orange-500">
                  New arrivals
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Painting
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Edition
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Drawing
                </span>

                <div className="font-bold text-2xl text-black">artalistic</div>

                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Photography
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Sculpture
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Artists
                </span>
                <span className="cursor-pointer text-gray-700 hover:text-gray-900">
                  Blog
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost">
                <Search className="h-5 w-5 cursor-pointer text-gray-600" />
              </Button>
              <Button size="icon" variant="ghost">
                <User className="h-5 w-5 cursor-pointer text-gray-600" />
              </Button>
              <Button size="icon" variant="ghost">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 cursor-pointer text-gray-600" />
                  <span className="-top-2 -right-2 absolute flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-xs">
                    0
                  </span>
                </div>
              </Button>
              <Button size="icon" variant="ghost">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 cursor-pointer text-gray-600" />
                  <span className="-top-2 -right-2 absolute flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-xs">
                    0
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
