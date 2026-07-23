/**
 * Smoke: ChargeQuote rounding / FX math (no network).
 * Run: node art-gallery/scripts/smoke-charge-quote.mjs
 */
import assert from "node:assert/strict"

function roundMoney(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function buildQuote({ provider, listingUsd, shippingUsd, rate }) {
  const totalUsd = roundMoney(listingUsd + shippingUsd)
  if (provider === "paypal") {
    return { chargedCurrency: "USD", chargedAmount: totalUsd, totalUsd, fxRate: null }
  }
  const chargedAmount = roundMoney(totalUsd * rate)
  return { chargedCurrency: "ETB", chargedAmount, totalUsd, fxRate: rate }
}

{
  const q = buildQuote({
    provider: "chapa",
    listingUsd: 100,
    shippingUsd: 25,
    rate: 139.44,
  })
  assert.equal(q.totalUsd, 125)
  assert.equal(q.chargedCurrency, "ETB")
  assert.equal(q.chargedAmount, roundMoney(125 * 139.44))
  console.log("✓ Chapa S1: $125 → ETB at locked rate")
}

{
  const q = buildQuote({
    provider: "paypal",
    listingUsd: 100,
    shippingUsd: 25,
    rate: 139.44,
  })
  assert.equal(q.chargedCurrency, "USD")
  assert.equal(q.chargedAmount, 125)
  assert.equal(q.fxRate, null)
  console.log("✓ PayPal: $125 charged USD, no FX")
}

{
  const artistUsd = 90
  const fx = 140
  const artistEtb = roundMoney(artistUsd * fx)
  assert.equal(artistEtb, 12600)
  console.log("✓ Seller Chapa credit uses FX on USD net")
}

console.log("\nAll charge-quote smoke checks passed.")
