import { useEffect, useMemo, useRef, useState } from "react"
import { useUpdateProfile } from "@/services/users/useUpdateProfile"
import { UserProfile } from "@/types/user.types"
import { Button } from "@/components/ui/button"
import { MapPin, Edit2, Check, X } from "lucide-react"
import { StructuredAddressFields } from "@/components/address/StructuredAddressFields"
import { PhoneWithCountryInput } from "@/components/address/PhoneWithCountryInput"
import type { StructuredAddress } from "@/lib/photon-address"
import {
  countryRequiresState,
  getShippingAddressIssues,
  hasCompleteShippingAddress,
  checkPostalAddressCoherence,
  composeInternationalPhone,
  getNationalPhoneDigits,
} from "@/lib/shipping-address"

type AddressFields = Pick<
  UserProfile,
  | "addressLine1"
  | "addressLine2"
  | "addressCity"
  | "addressState"
  | "addressZipCode"
  | "addressCountry"
  | "addressPhone"
  | "name"
>

export function ShippingAddressForm({ profile }: { profile: Partial<UserProfile> }) {
  const { updateProfile, isUpdating } = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // Keep last saved address so the read-only view updates before profile refetch lands.
  const [savedAddress, setSavedAddress] = useState<Partial<AddressFields> | null>(null)

  const [formAddress, setFormAddress] = useState<StructuredAddress>({
    addressLine1: profile.addressLine1 || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.addressCity || "",
    state: profile.addressState || "",
    zipCode: profile.addressZipCode || "",
    country: profile.addressCountry || "US",
  })
  const [phone, setPhone] = useState(profile.addressPhone || "")
  const phoneCountryRef = useRef(profile.addressCountry || "US")

  const displayProfile = useMemo(
    () => ({ ...profile, ...savedAddress }),
    [profile, savedAddress],
  )

  // When country changes, keep the national digits the user typed and rebuild +dial.
  useEffect(() => {
    if (!isEditing) {
      phoneCountryRef.current = formAddress.country
      return
    }
    const nextCountry = formAddress.country.trim().toUpperCase()
    const prevCountry = phoneCountryRef.current.trim().toUpperCase()
    phoneCountryRef.current = formAddress.country
    if (!nextCountry || prevCountry === nextCountry) return

    setPhone((current) => {
      if (!current.trim()) return ""
      const national = getNationalPhoneDigits(current, prevCountry || nextCountry)
      if (!national) return ""
      return composeInternationalPhone(national, nextCountry)
    })
  }, [formAddress.country, isEditing])

  // Drop local override once server profile catches up with the same values.
  useEffect(() => {
    if (!savedAddress) return
    const synced =
      (savedAddress.addressLine1 ?? "") === (profile.addressLine1 ?? "") &&
      (savedAddress.addressCity ?? "") === (profile.addressCity ?? "") &&
      (savedAddress.addressState ?? "") === (profile.addressState ?? "") &&
      (savedAddress.addressZipCode ?? "") === (profile.addressZipCode ?? "") &&
      (savedAddress.addressCountry ?? "") === (profile.addressCountry ?? "") &&
      (savedAddress.addressPhone ?? "") === (profile.addressPhone ?? "")
    if (synced) setSavedAddress(null)
  }, [profile, savedAddress])

  const startEditing = () => {
    setFormAddress({
      addressLine1: displayProfile.addressLine1 || "",
      addressLine2: displayProfile.addressLine2 || "",
      city: displayProfile.addressCity || "",
      state: displayProfile.addressState || "",
      zipCode: displayProfile.addressZipCode || "",
      country: displayProfile.addressCountry || "US",
    })
    setPhone(displayProfile.addressPhone || "")
    phoneCountryRef.current = displayProfile.addressCountry || "US"
    setFormError(null)
    setIsEditing(true)
  }

  const handleSave = async () => {
    const payload = {
      addressLine1: formAddress.addressLine1,
      addressLine2: formAddress.addressLine2,
      addressCity: formAddress.city,
      addressState: formAddress.state,
      addressZipCode: formAddress.zipCode,
      addressCountry: formAddress.country,
      addressPhone: phone,
    }

    const issues = getShippingAddressIssues({
      name: displayProfile.name || "Artist",
      ...payload,
    })
    if (issues.length > 0) {
      setFormError(issues[0])
      return
    }

    const coherence = await checkPostalAddressCoherence({
      city: formAddress.city,
      state: formAddress.state,
      zipCode: formAddress.zipCode,
      country: formAddress.country,
    })
    if (!coherence.ok) {
      setFormError(coherence.message)
      return
    }

    try {
      setFormError(null)
      await updateProfile(payload)
      setSavedAddress(payload)
      setIsEditing(false)
    } catch (error: any) {
      // useUpdateProfile already toasts; surface API message in the form too.
      const message =
        error?.message ||
        error?.errors?.[0] ||
        (Array.isArray(error?.data) ? error.data[0] : null) ||
        "Failed to save shipping address"
      setFormError(typeof message === "string" ? message : "Failed to save shipping address")
    }
  }

  if (!isEditing) {
    const hasAddress = hasCompleteShippingAddress({
      name: displayProfile.name || "Artist",
      addressLine1: displayProfile.addressLine1,
      addressCity: displayProfile.addressCity,
      addressState: displayProfile.addressState,
      addressZipCode: displayProfile.addressZipCode,
      addressCountry: displayProfile.addressCountry,
      addressPhone: displayProfile.addressPhone,
    })

    return (
      <div className="rounded-md border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-gray-900 text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Shipping Address
          </h2>
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>

        {hasAddress ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">Address Line 1</p>
              <p className="font-medium text-sm">{displayProfile.addressLine1}</p>
            </div>
            {displayProfile.addressLine2 && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Address Line 2</p>
                <p className="font-medium text-sm">{displayProfile.addressLine2}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">City</p>
              <p className="font-medium text-sm">{displayProfile.addressCity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">State / Province</p>
              <p className="font-medium text-sm">{displayProfile.addressState || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">Zip / Postal Code</p>
              <p className="font-medium text-sm">{displayProfile.addressZipCode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">Country</p>
              <p className="font-medium text-sm">{displayProfile.addressCountry || "US"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">Contact Phone</p>
              <p className="font-medium text-sm">{displayProfile.addressPhone || "N/A"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-gray-500 text-sm">
              Your shipping address is missing or incomplete.
              <br />
              Add a complete origin address (including phone
              {countryRequiresState(displayProfile.addressCountry) ? " and state" : ""}) so
              FedEx labels can be generated when your artwork sells.
            </p>
            <Button className="mt-4" onClick={startEditing}>
              Add Shipping Address
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-amber-100 bg-amber-50/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-medium text-gray-900 text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          Edit Shipping Address
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            <X className="h-4 w-4 mr-1.5" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              "Saving..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      {formError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs">
          {formError}
        </p>
      )}

      <StructuredAddressFields
        value={formAddress}
        onChange={setFormAddress}
        disabled={isUpdating}
        idPrefix="seller-ship"
      />

      <div className="mt-4 space-y-1.5">
        <label htmlFor="seller-ship-phone" className="text-xs font-medium text-gray-700">
          Contact Phone *
        </label>
        <PhoneWithCountryInput
          id="seller-ship-phone"
          country={formAddress.country}
          value={phone}
          onChange={setPhone}
          disabled={isUpdating}
        />
      </div>
    </div>
  )
}
