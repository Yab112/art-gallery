import { useMemo, type KeyboardEvent } from "react"
import PhoneInput, { type Country } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"
import "@/components/address/phone-input.css"
import {
  getMaxNationalPhoneLength,
  getNationalPhoneDigits,
  limitPhoneInputForCountry,
} from "@/lib/shipping-address"
import { isValidPhoneNumber } from "libphonenumber-js"
import { cn } from "@/lib/utils"

type PhoneWithCountryInputProps = {
  country: string
  value: string
  onChange: (fullPhone: string) => void
  id?: string
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * International phone input (SVG flag + dial code + national number)
 * via react-phone-number-input. Follows address country; defaults to US.
 */
export function PhoneWithCountryInput({
  country,
  value,
  onChange,
  id,
  disabled = false,
  className,
  placeholder,
}: PhoneWithCountryInputProps) {
  const trimmed = country.trim().toUpperCase()
  const countryCode: Country =
    trimmed.length === 2 ? (trimmed as Country) : "US"

  const maxNational = useMemo(
    () => getMaxNationalPhoneLength(countryCode),
    [countryCode],
  )

  const atMaxLength = useMemo(() => {
    if (!value) return false
    if (isValidPhoneNumber(value, countryCode)) return true
    if (maxNational == null) return false
    return getNationalPhoneDigits(value, countryCode).length >= maxNational
  }, [countryCode, value, maxNational])

  return (
    <PhoneInput
      id={id}
      flags={flags}
      international
      withCountryCallingCode
      countryCallingCodeEditable={false}
      country={countryCode}
      defaultCountry={countryCode}
      value={value || undefined}
      onChange={(next) => {
        onChange(limitPhoneInputForCountry(next || "", value, countryCode))
      }}
      disabled={disabled}
      placeholder={placeholder || "Phone number"}
      className={cn("PhoneInputArt", className)}
      numberInputProps={{
        className: "PhoneInputArt-input",
        inputMode: "numeric",
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
          // Block digit entry once the number is complete for this country.
          if (!atMaxLength) return
          if (e.ctrlKey || e.metaKey || e.altKey) return
          if (e.key.length === 1 && /\d/.test(e.key)) {
            e.preventDefault()
          }
        },
      }}
      countrySelectProps={{
        disabled: true,
        className: "PhoneInputArt-country",
        title: `${countryCode} dialing code${
          trimmed.length === 2 ? " (from address country)" : " (default US)"
        }`,
      }}
    />
  )
}
