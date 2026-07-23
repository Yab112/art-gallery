import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, MapPin, Search } from "lucide-react"
import {
  SUPPORTED_COUNTRIES,
  getStateOptions,
  hasStateDropdown,
  lookupPostalCode,
} from "@/lib/location-data"
import {
  searchAddresses,
  toStateCode,
  type AddressSuggestion,
  type StructuredAddress,
} from "@/lib/photon-address"
import { countryRequiresState, countrySupportsPostalPlaceLookup } from "@/lib/shipping-address"

type FieldErrors = Partial<Record<keyof StructuredAddress, string>>

type StructuredAddressFieldsProps = {
  value: StructuredAddress
  onChange: (next: StructuredAddress) => void
  errors?: FieldErrors
  disabled?: boolean
  idPrefix?: string
  showHelperText?: boolean
}

export function StructuredAddressFields({
  value,
  onChange,
  errors = {},
  disabled = false,
  idPrefix = "addr",
  showHelperText = true,
}: StructuredAddressFieldsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [zipLookupStatus, setZipLookupStatus] = useState<
    "idle" | "loading" | "ok" | "miss"
  >("idle")
  const [cityChoices, setCityChoices] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const stateOptions = getStateOptions(value.country)
  const useStateSelect = hasStateDropdown(value.country)
  const stateRequired = countryRequiresState(value.country)

  const patch = (partial: Partial<StructuredAddress>) => {
    onChange({ ...value, ...partial })
  }

  useEffect(() => {
    if (disabled) return
    const q = searchQuery.trim()
    if (q.length < 3) {
      setSuggestions([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const results = await searchAddresses(q, {
          countryCode: value.country || undefined,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setSuggestions(results)
          setSearchOpen(true)
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false)
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [searchQuery, value.country, disabled])

  const handleCountryChange = (country: string) => {
    onChange({
      ...value,
      country,
      state: "",
      city: "",
      zipCode: "",
    })
    setCityChoices([])
    setZipLookupStatus("idle")
    setSuggestions([])
  }

  const applySuggestion = (suggestion: AddressSuggestion) => {
    // Applying an explicit pick always wins — including setting/switching country.
    const nextCountry = (
      suggestion.address.country ||
      value.country ||
      ""
    ).toUpperCase()
    // Always resolve against the final country so the state Select gets an ISO code.
    const nextState =
      toStateCode(
        nextCountry,
        suggestion.address.state || suggestion.stateRaw || "",
      ) ||
      (suggestion.address.state.length <= 3 ? suggestion.address.state.toUpperCase() : "") ||
      ""

    const nextAddress: StructuredAddress = {
      addressLine1: suggestion.address.addressLine1 || "",
      addressLine2: value.addressLine2,
      city: suggestion.address.city || "",
      state: nextState,
      zipCode: suggestion.address.zipCode || "",
      country: nextCountry,
    }

    onChange(nextAddress)
    setSearchQuery(suggestion.label)
    setSuggestions([])
    setSearchOpen(false)
    setCityChoices([])
    setZipLookupStatus("idle")

    // If Photon omitted/mismatched state but ZIP is present, fill from Zippopotam.
    const zip = nextAddress.zipCode.trim()
    if (zip && nextCountry && countrySupportsPostalPlaceLookup(nextCountry)) {
      void (async () => {
        setZipLookupStatus("loading")
        try {
          const places = await lookupPostalCode(nextCountry, zip)
          if (places.length === 0) {
            setZipLookupStatus(nextState ? "idle" : "miss")
            return
          }
          const uniqueCities = [...new Set(places.map((p) => p.city))]
          setCityChoices(uniqueCities)
          onChange({
            ...nextAddress,
            zipCode: places[0].zipCode || nextAddress.zipCode,
            state: places[0].stateCode || nextAddress.state,
            city: nextAddress.city || places[0].city,
          })
          // Only celebrate ZIP fill when Zippopotam actually resolved a state code.
          setZipLookupStatus(places[0].stateCode ? "ok" : nextState ? "idle" : "miss")
        } catch {
          setZipLookupStatus(nextState ? "idle" : "miss")
        }
      })()
    }
  }

  const handleZipBlur = async () => {
    const country = value.country.toUpperCase()
    if (!countrySupportsPostalPlaceLookup(country)) return
    if (!value.zipCode.trim()) return

    setZipLookupStatus("loading")
    try {
      const places = await lookupPostalCode(country, value.zipCode)
      if (places.length === 0) {
        setZipLookupStatus("miss")
        setCityChoices([])
        return
      }

      const uniqueCities = [...new Set(places.map((p) => p.city))]
      setCityChoices(uniqueCities)
      patch({
        zipCode: places[0].zipCode,
        state: places[0].stateCode,
        city: places[0].city,
      })
      setZipLookupStatus("ok")
    } catch {
      setZipLookupStatus("miss")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-country`} className="text-xs font-medium text-gray-700">
          Country *
        </label>
        <Select
          value={value.country}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${idPrefix}-country`}
            className={`w-full h-[38px] border-gray-200 ${errors.country ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-search`}
          className="text-xs font-medium text-gray-700 flex items-center gap-1.5"
        >
          <Search className="h-3.5 w-3.5 text-gray-400" />
          Search address
        </label>
        <div className="relative">
          <Input
            id={`${idPrefix}-search`}
            value={searchQuery}
            disabled={disabled}
            autoComplete="off"
            placeholder="Start typing a street address…"
            className="pr-9"
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setSearchOpen(true)
            }}
            onBlur={() => {
              window.setTimeout(() => setSearchOpen(false), 150)
            }}
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}

          {searchOpen && suggestions.length > 0 && (
            <ul
              className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      applySuggestion(suggestion)
                    }}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span className="text-gray-800">{suggestion.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-gray-500 text-xs">
          Powered by OpenStreetMap. Type a full street address (e.g. “123 Main St, Austin”) for the best matches — short place names return cities/neighborhoods.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${idPrefix}-line1`} className="text-xs font-medium text-gray-700">
            Address Line 1 *
          </label>
          <Input
            id={`${idPrefix}-line1`}
            value={value.addressLine1}
            disabled={disabled}
            onChange={(e) => patch({ addressLine1: e.target.value })}
            placeholder="123 Main St"
            className={errors.addressLine1 ? "border-red-500" : ""}
          />
          {errors.addressLine1 && (
            <p className="text-red-500 text-xs">{errors.addressLine1}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${idPrefix}-line2`} className="text-xs font-medium text-gray-700">
            Address Line 2
          </label>
          <Input
            id={`${idPrefix}-line2`}
            value={value.addressLine2}
            disabled={disabled}
            onChange={(e) => patch({ addressLine2: e.target.value })}
            placeholder="Apt, suite, unit…"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-zip`} className="text-xs font-medium text-gray-700">
            Zip / Postal Code *
          </label>
          <div className="relative">
            <Input
              id={`${idPrefix}-zip`}
              value={value.zipCode}
              disabled={disabled}
              onChange={(e) => {
                patch({ zipCode: e.target.value })
                setZipLookupStatus("idle")
              }}
              onBlur={handleZipBlur}
              placeholder={value.country === "US" ? "10001" : "Postal code"}
              className={errors.zipCode ? "border-red-500" : ""}
            />
            {zipLookupStatus === "loading" && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>
          {errors.zipCode && <p className="text-red-500 text-xs">{errors.zipCode}</p>}
          {zipLookupStatus === "ok" && (
            <p className="text-green-700 text-xs">City and state filled from ZIP.</p>
          )}
          {zipLookupStatus === "miss" && (
            <p className="text-amber-700 text-xs">
              ZIP not found — check the code or fill city/state manually.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-state`} className="text-xs font-medium text-gray-700">
            State / Province{stateRequired || useStateSelect ? " *" : ""}
          </label>
          {useStateSelect ? (
            <Select
              key={`state-${value.country}`}
              value={value.state || undefined}
              onValueChange={(state) => patch({ state })}
              disabled={disabled}
            >
              <SelectTrigger
                id={`${idPrefix}-state`}
                className={`w-full h-[38px] border-gray-200 ${errors.state ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select state/province" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`${idPrefix}-state`}
              value={value.state}
              disabled={disabled}
              onChange={(e) => patch({ state: e.target.value })}
              placeholder="Optional"
              className={errors.state ? "border-red-500" : ""}
            />
          )}
          {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor={`${idPrefix}-city`} className="text-xs font-medium text-gray-700">
            City *
          </label>
          {cityChoices.length > 1 ? (
            <Select
              value={value.city || undefined}
              onValueChange={(city) => patch({ city })}
              disabled={disabled}
            >
              <SelectTrigger
                id={`${idPrefix}-city`}
                className={`w-full h-[38px] border-gray-200 ${errors.city ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cityChoices.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`${idPrefix}-city`}
              value={value.city}
              disabled={disabled}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="City"
              className={errors.city ? "border-red-500" : ""}
            />
          )}
          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
        </div>
      </div>

      {showHelperText && (
        <p className="text-gray-500 text-xs">
          * Required for FedEx rates and label generation. Prefer searching the address so
          country, state, city, and ZIP stay consistent.
        </p>
      )}
    </div>
  )
}
