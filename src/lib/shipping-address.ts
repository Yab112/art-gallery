/**
 * Address field validation via maintained libraries:
 * - phone: libphonenumber-js (Google libphonenumber)
 * - postal: postal-codes-js
 * - state required: country-state-city (has subdivisions)
 */

import {
  getCountryCallingCode,
  isValidPhoneNumber,
  Metadata,
  parsePhoneNumberFromString,
} from "libphonenumber-js"
import type { CountryCode } from "libphonenumber-js"
import postalCodes from "postal-codes-js"
import { State } from "country-state-city"

export type ShippingAddressFields = {
  name?: string | null
  addressLine1?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressZipCode?: string | null
  addressCountry?: string | null
  addressPhone?: string | null
}

/** National significant number digits (no country calling code). */
export function getNationalPhoneDigits(phone: string, country: string): string {
  const countryCode = country.trim().toUpperCase()
  const trimmed = phone.trim()
  if (!trimmed) return ""

  const international = parsePhoneNumberFromString(trimmed)
  if (international?.nationalNumber) return international.nationalNumber

  if (countryCode) {
    const parsed = parsePhoneNumberFromString(trimmed, countryCode as CountryCode)
    if (parsed?.nationalNumber) return parsed.nationalNumber
  }

  try {
    const dial = getCountryCallingCode(countryCode as CountryCode)
    let digits = trimmed.replace(/\D/g, "")
    if (digits.startsWith(dial) && digits.length > dial.length) {
      digits = digits.slice(dial.length)
    }
    return digits
  } catch {
    return trimmed.replace(/\D/g, "")
  }
}

/** Build E.164 from national digits + country. */
export function composeInternationalPhone(nationalDigits: string, country: string): string {
  const countryCode = country.trim().toUpperCase()
  const national = nationalDigits.replace(/\D/g, "")
  if (!national) return ""

  if (countryCode) {
    const parsed = parsePhoneNumberFromString(national, countryCode as CountryCode)
    if (parsed) return parsed.format("E.164")
  }

  try {
    const dial = getCountryCallingCode(countryCode as CountryCode)
    return `+${dial}${national}`
  } catch {
    return national
  }
}

/** Max national significant number length for a country (libphonenumber metadata). */
export function getMaxNationalPhoneLength(country?: string | null): number | null {
  const countryCode = (country || "").trim().toUpperCase()
  if (!countryCode) return null
  try {
    const meta = new Metadata()
    meta.selectNumberingPlan(countryCode as CountryCode)
    const lengths = meta.numberingPlan?.possibleLengths()
    if (!lengths?.length) return null
    return Math.max(...lengths)
  } catch {
    return null
  }
}

/**
 * Reject / truncate phone input once national length hits the country max,
 * or once the current value is already a valid number for that country.
 */
export function limitPhoneInputForCountry(
  nextPhone: string,
  currentPhone: string,
  country: string,
): string {
  const countryCode = country.trim().toUpperCase()
  const incoming = nextPhone.trim()
  if (!incoming) return ""

  const currentDigits = currentPhone.replace(/\D/g, "")
  const nextDigits = incoming.replace(/\D/g, "")

  // Already complete — allow edits/deletes, block adding more digits.
  if (
    countryCode &&
    currentPhone &&
    isValidPhoneNumber(currentPhone, countryCode as CountryCode) &&
    nextDigits.length > currentDigits.length
  ) {
    return currentPhone
  }

  const maxNational = getMaxNationalPhoneLength(countryCode)
  if (maxNational == null) return incoming

  const national = getNationalPhoneDigits(incoming, countryCode)
  if (national.length <= maxNational) return incoming

  return composeInternationalPhone(national.slice(0, maxNational), countryCode)
}

export function getPhoneIssue(phone: string, country: string): string | null {
  const countryCode = country.trim().toUpperCase()
  if (!countryCode) return "Country is required to validate phone"
  if (!phone.trim()) return "Phone number is required"

  try {
    if (!isValidPhoneNumber(phone, countryCode as CountryCode)) {
      return "Enter a valid phone number for this country"
    }
  } catch {
    return "Enter a valid phone number for this country"
  }
  return null
}

export function getPostalCodeIssue(postalCode: string, country: string): string | null {
  const value = postalCode.trim()
  const countryCode = country.trim().toUpperCase()
  if (!countryCode) return "Country is required to validate postal code"
  if (!value) return "Postal/ZIP code is required"

  try {
    const result = postalCodes.validate(countryCode, value)
    if (result === true) return null
    return typeof result === "string"
      ? result
      : "Postal/ZIP code format is invalid for this country"
  } catch {
    // Unknown country in the library — fall back to a loose length check.
    if (value.length < 3 || value.length > 12) {
      return "Postal/ZIP code length is invalid"
    }
    return null
  }
}

function normalizePlaceName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * When Zippopotam can resolve the ZIP with usable state/city data, require coherence.
 * Incomplete Zippopotam rows (common for JP: empty state abbreviation, neighborhood
 * place names) are skipped so Photon autocomplete results are not falsely rejected.
 */
export async function checkPostalAddressCoherence(address: {
  city: string
  state: string
  zipCode: string
  country: string
}): Promise<
  { ok: true } | { ok: false; field: "city" | "state" | "zipCode"; message: string }
> {
  const country = address.country.trim().toUpperCase()
  const postalIssue = getPostalCodeIssue(address.zipCode, country)
  if (postalIssue) {
    return { ok: false, field: "zipCode", message: postalIssue }
  }

  const { lookupPostalCode } = await import("./location-data")
  const { toStateCode } = await import("./photon-address")
  const places = await lookupPostalCode(country, address.zipCode)
  // No free place lookup for this country — format checks alone are enough.
  if (places.length === 0) {
    return { ok: true }
  }

  const enriched = places.map((p) => ({
    ...p,
    stateCode: p.stateCode || toStateCode(country, p.stateName) || "",
  }))

  const stateCode = address.state.trim().toUpperCase()
  const placesWithState = enriched.filter((p) => p.stateCode)
  if (stateCode && placesWithState.length > 0) {
    const matchesState = placesWithState.some(
      (p) => p.stateCode.toUpperCase() === stateCode,
    )
    if (!matchesState) {
      const expected = [...new Set(placesWithState.map((p) => p.stateCode))].join(", ")
      return {
        ok: false,
        field: "state",
        message: `State/province does not match ZIP ${places[0].zipCode} (expected ${expected})`,
      }
    }
  }

  // Zippopotam "place name" is reliable for US/CA cities; elsewhere it is often a
  // neighborhood/block and will disagree with OSM city — don't block those.
  const strictCityCountries = new Set(["US", "CA"])
  if (strictCityCountries.has(country)) {
    const city = normalizePlaceName(address.city)
    if (city && !places.some((p) => normalizePlaceName(p.city) === city)) {
      const examples = [...new Set(places.map((p) => p.city))].slice(0, 3).join(", ")
      return {
        ok: false,
        field: "city",
        message: `City does not match ZIP ${places[0].zipCode}. Use: ${examples}`,
      }
    }
  }

  return { ok: true }
}

export function getShippingAddressIssues(fields: ShippingAddressFields): string[] {
  const issues: string[] = []
  const country = fields.addressCountry?.trim().toUpperCase() ?? ""

  if (!fields.addressLine1?.trim()) issues.push("Address line 1 is required")
  if (!fields.addressCity?.trim()) issues.push("City is required")
  if (!fields.addressZipCode?.trim()) issues.push("Postal/ZIP code is required")
  if (!country) issues.push("Country is required")
  if (!fields.addressPhone?.trim()) issues.push("Contact phone is required")

  if (country && countryRequiresState(country) && !fields.addressState?.trim()) {
    issues.push(`State/province is required for ${country}`)
  }

  if (country && fields.addressZipCode?.trim()) {
    const postalIssue = getPostalCodeIssue(fields.addressZipCode, country)
    if (postalIssue) issues.push(postalIssue)
  }

  if (country && fields.addressPhone?.trim()) {
    const phoneIssue = getPhoneIssue(fields.addressPhone, country)
    if (phoneIssue) issues.push(phoneIssue)
  }

  return issues
}

export function hasCompleteShippingAddress(fields: ShippingAddressFields): boolean {
  return getShippingAddressIssues(fields).length === 0
}

export function countryRequiresState(country?: string | null): boolean {
  const code = (country || "").trim().toUpperCase()
  if (!code) return false
  // country-state-city includes counties for some countries (e.g. GB).
  // Treat as required only when the subdivision list looks like regions/states.
  const count = State.getStatesOfCountry(code).length
  return count > 0 && count <= 80
}

/** True when the free Zippopotam API is likely to resolve this country's postal codes. */
export function countrySupportsPostalPlaceLookup(country?: string | null): boolean {
  // Zippopotam coverage is discovered at call time; we attempt lookup for any country.
  // Keep a soft gate so the UI still offers ZIP autofill without blocking non-covered countries.
  return Boolean((country || "").trim())
}

export function normalizePhoneDigits(phone: string, country: string): string | null {
  const parsed = parsePhoneNumberFromString(phone, country.trim().toUpperCase() as CountryCode)
  if (!parsed || !parsed.isValid()) return null
  return parsed.nationalNumber
}
