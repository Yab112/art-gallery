import { getStateOptions } from "./location-data"

export type StructuredAddress = {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type AddressSuggestion = {
  id: string
  label: string
  address: StructuredAddress
  /** Original Photon state label before ISO mapping (for re-resolve). */
  stateRaw?: string
  /** Higher = more useful as a shippable street address */
  rank: number
}

type PhotonFeature = {
  properties?: {
    osm_id?: number
    osm_type?: string
    osm_key?: string
    osm_value?: string
    type?: string
    name?: string
    housenumber?: string
    street?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    district?: string
    state?: string
    country?: string
    countrycode?: string
    postcode?: string
  }
}

type PhotonResponse = {
  features?: PhotonFeature[]
}

function normalizeStateLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’`]/g, "")
    .replace(/\b(prefecture|province|state|county|region|department|oblast|emirate)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Loose romaji so Zippopotam **/
function looseStateKey(value: string): string {
  return normalizeStateLabel(value)
    .replace(/ou/g, "o")
    .replace(/uu/g, "u")
    .replace(/oo/g, "o")
    .replace(/fu$/g, "")
    .replace(/\s+/g, "")
}

/**
 * Map Photon / free-text state names to ISO subdivision codes used by the state Select.
 * Returns "" when it cannot resolve to a known code (avoids Radix Select blanking on bad values).
 */
export function toStateCode(country: string, stateRaw: string): string {
  const value = stateRaw.trim()
  if (!value) return ""

  const countryCode = country.trim().toUpperCase()
  const list = countryCode ? getStateOptions(countryCode) : []

  if (!list.length) {
    return value.length <= 3 ? value.toUpperCase() : value
  }

  const upper = value.toUpperCase()
  const byCode = list.find((s) => s.code.toUpperCase() === upper)
  if (byCode) return byCode.code

  // JP / numeric codes: "5" → "05"
  if (/^\d+$/.test(value)) {
    const byNumber = list.find(
      (s) => /^\d+$/.test(s.code) && Number(s.code) === Number(value),
    )
    if (byNumber) return byNumber.code
  }

  const byExactName = list.find((s) => s.name.toLowerCase() === value.toLowerCase())
  if (byExactName) return byExactName.code

  const normalized = normalizeStateLabel(value)
  if (normalized) {
    const byNormalized = list.find((s) => normalizeStateLabel(s.name) === normalized)
    if (byNormalized) return byNormalized.code

    const byIncludes = list.find((s) => {
      const n = normalizeStateLabel(s.name)
      return n.includes(normalized) || normalized.includes(n)
    })
    if (byIncludes) return byIncludes.code

    const loose = looseStateKey(value)
    if (loose) {
      const byLoose = list.find((s) => {
        const key = looseStateKey(s.name)
        return key === loose || key.includes(loose) || loose.includes(key)
      })
      if (byLoose) return byLoose.code
    }
  }

  return ""
}

function suggestionRank(props: NonNullable<PhotonFeature["properties"]>, streetLine: string): number {
  let rank = 0
  if (props.housenumber && props.street) rank += 40
  else if (props.street || streetLine.includes(" ")) rank += 25
  if (props.postcode) rank += 10
  if (props.city || props.town || props.village) rank += 5

  const layer = (props.type || "").toLowerCase()
  if (layer === "house") rank += 30
  else if (layer === "street") rank += 20
  else if (layer === "locality" || layer === "district") rank += 8
  else if (layer === "city") rank += 4

  const key = (props.osm_key || "").toLowerCase()
  if (key === "place") rank += 2
  if (key === "highway") rank += 15
  if (key === "building") rank += 20
  if (key === "information" || key === "amenity" || key === "tourism") rank -= 15

  return rank
}

export function parsePhotonFeature(feature: PhotonFeature): AddressSuggestion | null {
  const props = feature.properties
  if (!props) return null

  const city =
    props.city ||
    props.town ||
    props.village ||
    props.municipality ||
    ""

  const streetLine = [props.housenumber, props.street || props.name]
    .filter(Boolean)
    .join(" ")
    .trim()

  const country = (props.countrycode || "").toUpperCase()
  if (!streetLine && !city && !props.postcode) return null

  const stateRaw = props.state || ""
  const state = toStateCode(country, stateRaw)
  const labelParts = [
    streetLine,
    city,
    state || stateRaw,
    props.postcode,
    country || props.country,
  ].filter(Boolean)

  return {
    id: `${props.osm_type || "x"}-${props.osm_id || labelParts.join("-")}`,
    label: labelParts.join(", "),
    stateRaw,
    rank: suggestionRank(props, streetLine),
    address: {
      addressLine1: streetLine || props.name || "",
      addressLine2: "",
      city,
      state,
      zipCode: props.postcode || "",
      country,
    },
  }
}

/**
 * Free address autocomplete via Photon (Komoot / OpenStreetMap).
 * No API key and no billing account.
 * Debounce in the UI (~350ms) and avoid rapid-fire requests.
 */
export async function searchAddresses(
  query: string,
  options?: { countryCode?: string; limit?: number; signal?: AbortSignal },
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const limit = Math.min(Math.max(options?.limit ?? 12, 1), 20)
  const countryCode = options?.countryCode?.trim().toUpperCase() || ""

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    lang: "en",
  })

  if (countryCode) {
    params.set("countrycode", countryCode.toLowerCase())
  }

  for (const layer of ["house", "street", "locality", "district", "city"]) {
    params.append("layer", layer)
  }

  const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
    signal: options?.signal,
    headers: { Accept: "application/json" },
  })

  if (!response.ok) return []

  const data = (await response.json()) as PhotonResponse
  const suggestions: AddressSuggestion[] = []
  const seen = new Set<string>()

  for (const feature of data.features ?? []) {
    const parsed = parsePhotonFeature(feature)
    if (!parsed || seen.has(parsed.label)) continue
    if (countryCode && parsed.address.country && parsed.address.country !== countryCode) {
      continue
    }
    // Prefer resolving against the form-selected country when Photon state was empty.
    if (!parsed.address.state && parsed.stateRaw) {
      parsed.address.state = toStateCode(
        countryCode || parsed.address.country,
        parsed.stateRaw,
      )
    }
    seen.add(parsed.label)
    suggestions.push(parsed)
  }

  suggestions.sort((a, b) => b.rank - a.rank)
  return suggestions
}
