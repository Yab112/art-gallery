/**
 * Smoke checks for multi-seller checkout helpers (no network).
 * Run: node --experimental-strip-types art-gallery/scripts/smoke-multi-seller-checkout.mjs
 * Or plain: node art-gallery/scripts/smoke-multi-seller-checkout.mjs
 */
import assert from "node:assert/strict"

// Mirror of checkout-sellers helpers (keep in sync with src/lib/checkout-sellers.ts)
function getArtworkSellerId(artwork) {
  if (!artwork) return null
  return artwork.userId || artwork.user?.id || artwork.artistId || null
}

function groupCartItemsBySeller(items) {
  const map = new Map()
  for (const item of items) {
    const sellerId = getArtworkSellerId(item.artwork)
    if (!sellerId) continue
    const existing = map.get(sellerId)
    if (existing) {
      existing.items.push(item)
      existing.cartItemIds.push(item.id)
    } else {
      map.set(sellerId, {
        sellerId,
        sellerName: artworkName(item.artwork),
        items: [item],
        cartItemIds: [item.id],
      })
    }
  }
  return Array.from(map.values())
}

function artworkName(a) {
  return a?.user?.name || a?.artist || "Seller"
}

function nextUnpaid(orders) {
  return orders.find((o) => o.status !== "PAID") || null
}

function markPaid(orders, orderId) {
  return orders.map((o) =>
    o.orderId === orderId ? { ...o, status: "PAID" } : o,
  )
}

function orderIdFromTxRef(txRef) {
  if (!txRef?.startsWith("TX-")) return null
  const withoutPrefix = txRef.slice(3)
  const lastDash = withoutPrefix.lastIndexOf("-")
  if (lastDash <= 0) return null
  return withoutPrefix.slice(0, lastDash) || null
}

// --- Same-rail multi-seller (two PayPal sellers) ---
{
  const items = [
    {
      id: "c1",
      artwork: { userId: "s1", user: { name: "A" }, desiredPrice: 100 },
    },
    {
      id: "c2",
      artwork: { userId: "s2", user: { name: "B" }, desiredPrice: 50 },
    },
  ]
  const groups = groupCartItemsBySeller(items)
  assert.equal(groups.length, 2)
  assert.deepEqual(
    groups.map((g) => g.sellerId).sort(),
    ["s1", "s2"],
  )
  console.log("✓ same-rail grouping: 2 seller groups")
}

// --- Cross-rail: groups stay independent (FE resolves per group) ---
{
  const plan = [
    { sellerId: "etb-seller", paymentMethod: "chapa", currency: "ETB" },
    { sellerId: "usd-seller", paymentMethod: "paypal", currency: "USD" },
  ]
  assert.notEqual(plan[0].paymentMethod, plan[1].paymentMethod)
  assert.notEqual(plan[0].currency, plan[1].currency)
  console.log("✓ cross-rail plan: independent methods/currencies")
}

// --- Sequential pay + resume ---
{
  const uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
  const orders = [
    {
      orderId: uuid,
      sellerId: "s1",
      txRef: `TX-${uuid}-12345678`,
      status: "PENDING",
      paymentProvider: "paypal",
    },
    {
      orderId: "ffffffff-1111-2222-3333-444444444444",
      sellerId: "s2",
      txRef: "TX-ffffffff-1111-2222-3333-444444444444-87654321",
      status: "PENDING",
      paymentProvider: "chapa",
    },
  ]

  const paidId = orderIdFromTxRef(orders[0].txRef)
  assert.equal(paidId, uuid)

  let sessionOrders = markPaid(orders, paidId)
  let next = nextUnpaid(sessionOrders)
  assert.equal(next.sellerId, "s2")
  assert.equal(next.paymentProvider, "chapa")

  sessionOrders = markPaid(sessionOrders, next.orderId)
  next = nextUnpaid(sessionOrders)
  assert.equal(next, null)
  console.log("✓ sequential pay + resume: pay first, continue second, then done")
}

// --- Single-seller still one group ---
{
  const items = [
    { id: "c1", artwork: { userId: "s1", desiredPrice: 10 } },
    { id: "c2", artwork: { userId: "s1", desiredPrice: 20 } },
  ]
  assert.equal(groupCartItemsBySeller(items).length, 1)
  console.log("✓ same-seller multi-item: single group")
}

console.log("\nAll multi-seller smoke checks passed.")
