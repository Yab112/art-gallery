/** Country/state options + free ZIP lookup (Zippopotam) */

import { Country, State } from "country-state-city"

export type LocationOption = { code: string; name: string }

/** Curated countries offered in the marketplace address UI. */
export const SUPPORTED_COUNTRIES: LocationOption[] = [
  { code: "US", name: "United States (US)" },
  { code: "CA", name: "Canada (CA)" },
  { code: "GB", name: "United Kingdom (GB)" },
  { code: "FR", name: "France (FR)" },
  { code: "DE", name: "Germany (DE)" },
  { code: "IT", name: "Italy (IT)" },
  { code: "ES", name: "Spain (ES)" },
  { code: "AU", name: "Australia (AU)" },
  { code: "JP", name: "Japan (JP)" },
  { code: "CN", name: "China (CN)" },
  { code: "ET", name: "Ethiopia (ET)" },
  { code: "KE", name: "Kenya (KE)" },
  { code: "ZA", name: "South Africa (ZA)" },
  { code: "BR", name: "Brazil (BR)" },
  { code: "MX", name: "Mexico (MX)" },
  { code: "IN", name: "India (IN)" },
]

export function getStateOptions(countryCode: string): LocationOption[] {
  const country = countryCode.trim().toUpperCase()
  if (!country) return []

  return State.getStatesOfCountry(country).map((state) => ({
    code: state.isoCode,
    name: state.name,
  }))
}

export function hasStateDropdown(countryCode: string): boolean {
  // Align with countryRequiresState: show dropdown when subdivisions are state-like.
  const states = getStateOptions(countryCode)
  return states.length > 0 && states.length <= 80
}

export function getAllCountries(): LocationOption[] {
  return Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: `${c.name} (${c.isoCode})`,
  }))
}

export type PostalLookupPlace = {
  zipCode: string
  city: string
  stateCode: string
  stateName: string
  countryCode: string
}

type ZippopotamResponse = {
  "post code"?: string
  "country abbreviation"?: string
  places?: Array<{
    "place name": string
    state: string
    "state abbreviation": string
  }>
}

/** Free ZIP → city/state fill via Zippopotam. Coverage varies by country. */
export async function lookupPostalCode(
  countryCode: string,
  postalCode: string,
): Promise<PostalLookupPlace[]> {
  const country = countryCode.trim().toUpperCase()
  if (!country || !postalCode.trim()) return []

  const compact = postalCode.trim().replace(/\s+/g, "")
  const candidates = [
    compact.slice(0, 5),
    compact.slice(0, 3),
    compact,
    postalCode.trim(),
  ].filter((value, index, all) => value.length >= 2 && all.indexOf(value) === index)

  for (const pathPostal of candidates) {
    try {
      const response = await fetch(
        `https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(pathPostal)}`,
      )
      if (!response.ok) continue

      const data = (await response.json()) as ZippopotamResponse
      const zip = data["post code"] || pathPostal
      const places = data.places ?? []
      if (places.length === 0) continue

      const { toStateCode } = await import("./photon-address")

      return places.map((place) => {
        const stateName = place.state || ""
        const abbr = (place["state abbreviation"] || "").trim()
        return {
          zipCode: zip,
          city: place["place name"],
          stateCode: abbr || toStateCode(country, stateName) || "",
          stateName,
          countryCode: (data["country abbreviation"] || country).toUpperCase(),
        }
      })
    } catch {
      // try next candidate
    }
  }

  return []
}
