import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Heart } from "lucide-react";

// Mock cart data
const cartItems = [
  {
    id: "1",
    title: "Abstract Expression",
    artist: "Sarah Johnson",
    image: "/artwork-1.jpg",
    price: 2500,
    quantity: 1,
    size: "24x36 inches",
    medium: "Oil on Canvas",
  },
  {
    id: "2",
    title: "Urban Landscape",
    artist: "Michael Chen",
    image: "/artwork-2.jpg",
    price: 1800,
    quantity: 1,
    size: "18x24 inches",
    medium: "Acrylic on Canvas",
  },
];

const shippingCost = 150;
const taxRate = 0.08;

export function OrderSummary() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="bg-white rounded-lg border p-6 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.artist}</p>
              <p className="text-xs text-gray-500">
                {item.size} • {item.medium}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium text-gray-900">
                  ${item.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Heart className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <Button variant="outline" size="sm">
            Apply
          </Button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">${shippingCost}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Security Badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <span>30-day return guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
          <span>Authenticity certificate included</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600 mb-3">We accept:</p>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Visa
          </Badge>
          <Badge variant="outline" className="text-xs">
            Mastercard
          </Badge>
          <Badge variant="outline" className="text-xs">
            American Express
          </Badge>
          <Badge variant="outline" className="text-xs">
            PayPal
          </Badge>
        </div>
      </div>
    </div>
  );
}
