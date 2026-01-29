import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useCartItems } from "@/queries/cartQueries";
import { useRemoveFromCart } from "@/services/cart/useRemoveFromCart";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useEffect } from "react";

export function OrderSummary() {
  // Fetch cart data from backend
  const { data: cartData, isLoading } = useCartItems(1, 50);
  const { removeFromCart, isRemoving } = useRemoveFromCart();
  const { selectedCartItemIds, setSelectedCartItemIds } = useCheckout();

  const cartItems = cartData?.items || [];

  // Initialize: Select all items by default when cart loads or when new items are added
  useEffect(() => {
    if (cartItems.length > 0) {
      const currentItemIds = new Set(cartItems.map(item => item.id));

      // If no items are selected, select all
      if (selectedCartItemIds.size === 0) {
        setSelectedCartItemIds(currentItemIds);
      } else {
        // If new items were added, add them to selection
        const newItemIds = cartItems
          .filter(item => !selectedCartItemIds.has(item.id))
          .map(item => item.id);

        if (newItemIds.length > 0) {
          setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            newItemIds.forEach(id => newSet.add(id));
            return newSet;
          });
        }

        // Remove items that no longer exist in cart
        const removedItemIds = Array.from(selectedCartItemIds).filter(
          id => !currentItemIds.has(id)
        );

        if (removedItemIds.length > 0) {
          setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            removedItemIds.forEach(id => newSet.delete(id));
            return newSet;
          });
        }
      }
    } else {
      // Clear selection if cart is empty
      if (selectedCartItemIds.size > 0) {
        setSelectedCartItemIds(new Set());
      }
    }
  }, [cartItems, setSelectedCartItemIds]);

  // Get selected items (exclude sold or non-approved artworks)
  const selectedItems = cartItems.filter(item => {
    const isSelected = selectedCartItemIds.has(item.id);
    const isSold = item.artwork?.status === "SOLD";
    const isNotApproved = item.artwork?.status !== "APPROVED";
    return isSelected && !isSold && !isNotApproved;
  });

  // Calculate subtotal from SELECTED items only
  const subtotal = selectedItems.reduce((sum, item) => {
    const price = Number(item.artwork?.desiredPrice) || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Total is now just the subtotal (inclusive of platform fee)
  const total = subtotal;

  const handleToggleItem = (itemId: string) => {
    setSelectedCartItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(cartItems.map(item => item.id));
    setSelectedCartItemIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedCartItemIds(new Set());
  };

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const handleRemove = async (artworkId: string) => {
    try {
      // Find the cart item to get its ID
      const itemToRemove = cartItems.find(item => item.artworkId === artworkId);
      if (itemToRemove) {
        // Remove from selection if it was selected
        setSelectedCartItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemToRemove.id);
          return newSet;
        });
      }
      await removeFromCart(artworkId);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
        {cartItems.length > 0 && (
          <button
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-gray-500 py-4 text-center">Loading...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">Cart is empty</p>
        ) : (
          cartItems.map((item) => {
            const isSelected = selectedCartItemIds.has(item.id);
            const isSold = item.artwork?.status === "SOLD";
            const isNotApproved = item.artwork?.status !== "APPROVED";
            const isDisabled = isSold || isNotApproved;

            return (
              <div
                key={item.id}
                className={`flex gap-2 p-2 rounded border ${isSelected && !isDisabled ? "border-red-300" : "border-gray-200"
                  } ${isDisabled ? "opacity-60 bg-gray-50" : ""}`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <Checkbox
                    checked={isSelected && !isDisabled}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleToggleItem(item.id)}
                    className="h-3.5 w-3.5"
                  />
                </div>
                <img
                  src={item.artwork?.photos?.[0] || "/placeholder.svg"}
                  alt={item.artwork?.title || "Artwork"}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-gray-900 line-clamp-1">
                    {item.artwork?.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-gray-500">{item.artwork?.artist || "Unknown"}</p>
                  {isDisabled && (
                    <p className="text-xs text-red-600 mt-0.5 font-medium">
                      {isSold ? "Sold - Cannot purchase" : "Not available for purchase"}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-xs font-medium text-gray-900">
                      ${((Number(item.artwork?.desiredPrice) || 0) * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(item.artworkId)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Selection Info */}
      {cartItems.length > 0 && selectedItems.length === 0 && (
        <div className="mb-3 pb-3 border-b border-yellow-200">
          <p className="text-xs text-yellow-700">No items selected</p>
        </div>
      )}

      {/* Price Breakdown — Subtotal and Total are now the same (inclusive of fees) */}
      {selectedItems.length > 0 && (
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs py-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">Secure checkout • 30-day guarantee</p>
      </div>
    </div>
  );
}
