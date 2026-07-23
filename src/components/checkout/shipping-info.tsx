import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckout, ShippingOption } from "@/contexts/CheckoutContext"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useFedExRates } from "@/services/fedex/useFedExRates"
import { useCartItems } from "@/queries/cartQueries"
import { useMyProfile } from "@/queries/userQueries"
import { useUpdateProfile } from "@/services/users/useUpdateProfile"
import { Loader2, MapPin, Pencil } from "lucide-react"
import {
  countryRequiresState,
  getPhoneIssue,
  getPostalCodeIssue,
  checkPostalAddressCoherence,
  composeInternationalPhone,
  getNationalPhoneDigits,
  hasCompleteShippingAddress,
} from "@/lib/shipping-address"
import { StructuredAddressFields } from "@/components/address/StructuredAddressFields"
import { PhoneWithCountryInput } from "@/components/address/PhoneWithCountryInput"
import { formatMoney } from "@/lib/format-money"
import { groupCartItemsBySeller } from "@/lib/checkout-sellers"
import { findIncompatibleSellerPayments } from "@/lib/checkout-payment-compat"
import type { StructuredAddress } from "@/lib/photon-address"
import type { UserProfile } from "@/types/user.types"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ShippingInfoProps {
  onNext: () => void
  onPrevious: () => void
  /** Called when shipping country makes a selected payment method invalid */
  onPaymentMethodsInvalid?: () => void
}

/** Optional local logistics option — independent of payment provider. */
export function makeLocalDeliveryOption(currency: "USD" | "ETB" = "USD"): ShippingOption {
  return {
    serviceType: "LOCAL_DELIVERY",
    serviceName: "Local delivery",
    totalCharge: 0,
    currency,
  }
}

type AddressMode = "saved" | "orderOnly"

function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

function profileToAddress(profile?: Partial<UserProfile> | null): StructuredAddress {
  return {
    addressLine1: profile?.addressLine1 || "",
    addressLine2: profile?.addressLine2 || "",
    city: profile?.addressCity || "",
    state: profile?.addressState || "",
    zipCode: profile?.addressZipCode || "",
    country: profile?.addressCountry || "US",
  }
}

export function ShippingInfo({
  onNext,
  onPrevious,
  onPaymentMethodsInvalid,
}: ShippingInfoProps) {
  const {
    shippingData,
    setShippingData,
    selectedCartItemIds,
    sellerCheckouts,
    setSellerShippingOption,
    setSellerPaymentMethod,
  } = useCheckout()
  const queryClient = useQueryClient()
  const { data: profileResponse, isLoading: isProfileLoading } = useMyProfile()
  const profile = profileResponse?.profile
  const { updateProfile, isUpdating } = useUpdateProfile()
  const { mutateAsync: fetchRatesAsync, isPending: isFetchingRates } = useFedExRates()
  const { data: cartData } = useCartItems(1, 50)

  const sellerGroups = useMemo(() => {
    const items = (cartData?.items || []).filter((i) =>
      selectedCartItemIds.has(i.id),
    )
    return groupCartItemsBySeller(items)
  }, [cartData?.items, selectedCartItemIds])

  const allPaymentsSelected = sellerGroups.every(
    (g) => Boolean(sellerCheckouts[g.sellerId]?.paymentMethod),
  )

  const [showRates, setShowRates] = useState(false)
  const [rateOptionsBySeller, setRateOptionsBySeller] = useState<
    Record<string, ShippingOption[]>
  >({})
  const [rateError, setRateError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const hydratedFromProfile = useRef(false)

  useEffect(() => {
    if (!allPaymentsSelected) {
      onPrevious()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPaymentsSelected])

  const toShippingOption = (rate: ShippingOption): ShippingOption => ({
    serviceType: rate.serviceType,
    serviceName: rate.serviceName,
    totalCharge: rate.totalCharge,
    currency: rate.currency,
    ...(typeof rate.transitDays === "number" && Number.isFinite(rate.transitDays)
      ? { transitDays: rate.transitDays }
      : {}),
  })

  const profileComplete = useMemo(
    () =>
      hasCompleteShippingAddress({
        name: profile?.name || "Buyer",
        addressLine1: profile?.addressLine1,
        addressCity: profile?.addressCity,
        addressState: profile?.addressState,
        addressZipCode: profile?.addressZipCode,
        addressCountry: profile?.addressCountry,
        addressPhone: profile?.addressPhone,
      }),
    [profile],
  )

  const [addressMode, setAddressMode] = useState<AddressMode>("orderOnly")
  const [updateSavedAddress, setUpdateSavedAddress] = useState(false)

  const nameParts = splitName(profile?.name)
  const [formData, setFormData] = useState({
    firstName: shippingData?.firstName || nameParts.firstName,
    lastName: shippingData?.lastName || nameParts.lastName,
    email: shippingData?.email || profile?.email || "",
    phone: shippingData?.phone || profile?.addressPhone || "",
  })

  const [address, setAddress] = useState<StructuredAddress>(() => {
    if (shippingData?.address) {
      return {
        addressLine1: shippingData.address,
        addressLine2: shippingData.apartment || "",
        city: shippingData.city || "",
        state: shippingData.state || "",
        zipCode: shippingData.zipCode || "",
        country: shippingData.country || "US",
      }
    }
    return profileToAddress(profile)
  })

  const phoneCountryRef = useRef(address.country)

  // Hydrate from profile once (unless checkout already has shipping data).
  useEffect(() => {
    if (hydratedFromProfile.current || isProfileLoading || !profile) return
    if (shippingData?.address) {
      hydratedFromProfile.current = true
      setAddressMode(profileComplete ? "saved" : "orderOnly")
      return
    }

    const fromProfile = profileToAddress(profile)
    const names = splitName(profile.name)
    setAddress(fromProfile)
    setFormData((prev) => ({
      firstName: prev.firstName || names.firstName,
      lastName: prev.lastName || names.lastName,
      email: prev.email || profile.email || "",
      phone: prev.phone || profile.addressPhone || "",
    }))
    setAddressMode(profileComplete ? "saved" : "orderOnly")
    hydratedFromProfile.current = true
  }, [profile, isProfileLoading, shippingData, profileComplete])

  // Keep "saved" mode in sync when profile is edited (e.g. return from Settings).
  useEffect(() => {
    if (addressMode !== "saved" || !profileComplete || !profile) return
    setAddress(profileToAddress(profile))
    setFormData((prev) => ({
      ...prev,
      phone: profile.addressPhone || prev.phone,
    }))
  }, [
    addressMode,
    profileComplete,
    profile?.addressLine1,
    profile?.addressLine2,
    profile?.addressCity,
    profile?.addressState,
    profile?.addressZipCode,
    profile?.addressCountry,
    profile?.addressPhone,
  ])

  useEffect(() => {
    const nextCountry = address.country.trim().toUpperCase()
    const prevCountry = phoneCountryRef.current.trim().toUpperCase()
    phoneCountryRef.current = address.country
    if (!nextCountry || prevCountry === nextCountry) return

    // Country change can invalidate payment methods and shipping quotes
    setShowRates(false)
    setRateOptionsBySeller({})
    setRateError("")
    void queryClient.invalidateQueries({
      queryKey: ["checkout-available-methods"],
    })

    setFormData((prev) => {
      if (!prev.phone.trim()) return prev
      const national = getNationalPhoneDigits(prev.phone, prevCountry || nextCountry)
      if (!national) return { ...prev, phone: "" }
      return {
        ...prev,
        phone: composeInternationalPhone(national, nextCountry),
      }
    })
  }, [address.country, queryClient])

  const applySavedProfileAddress = () => {
    if (!profile) return
    const fromProfile = profileToAddress(profile)
    setAddress(fromProfile)
    setFormData((prev) => ({
      ...prev,
      phone: profile.addressPhone || prev.phone,
    }))
    setAddressMode("saved")
    setUpdateSavedAddress(false)
    setShowRates(false)
    setErrors({})
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const activeAddress =
    addressMode === "saved" && profileComplete ? profileToAddress(profile) : address
  const activePhone =
    addressMode === "saved" && profileComplete
      ? profile?.addressPhone || formData.phone
      : formData.phone

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const country = activeAddress.country.trim().toUpperCase() || "US"

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    if (addressMode === "saved" && !profileComplete) {
      newErrors.addressLine1 =
        "Add a complete shipping address in Settings, or use a different address for this order."
    }

    if (!activePhone.trim()) newErrors.phone = "Phone number is required"
    else {
      const phoneIssue = getPhoneIssue(activePhone, country)
      if (phoneIssue) newErrors.phone = phoneIssue
    }
    if (!activeAddress.addressLine1.trim()) newErrors.addressLine1 = "Address is required"
    if (!activeAddress.city.trim()) newErrors.city = "City is required"
    if (countryRequiresState(country) && !activeAddress.state.trim()) {
      newErrors.state = `State/province is required for ${country}`
    }
    if (!activeAddress.zipCode.trim()) newErrors.zipCode = "ZIP/postal code is required"
    else {
      const postalIssue = getPostalCodeIssue(activeAddress.zipCode, country)
      if (postalIssue) newErrors.zipCode = postalIssue
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const coherence = await checkPostalAddressCoherence({
      city: activeAddress.city,
      state: activeAddress.state,
      zipCode: activeAddress.zipCode,
      country: activeAddress.country,
    })
    if (!coherence.ok) {
      setErrors((prev) => ({ ...prev, [coherence.field]: coherence.message }))
      return
    }

    if (addressMode === "orderOnly" && updateSavedAddress) {
      try {
        await updateProfile({
          addressLine1: activeAddress.addressLine1,
          addressLine2: activeAddress.addressLine2,
          addressCity: activeAddress.city,
          addressState: activeAddress.state,
          addressZipCode: activeAddress.zipCode,
          addressCountry: activeAddress.country,
          addressPhone: activePhone,
        })
      } catch (error: any) {
        toast.error(error?.message || "Failed to update saved shipping address")
        return
      }
    }

    setShippingData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: activePhone,
      address: activeAddress.addressLine1,
      apartment: activeAddress.addressLine2,
      city: activeAddress.city,
      state: activeAddress.state,
      zipCode: activeAddress.zipCode,
      country: activeAddress.country,
    })

    // Re-resolve payment methods against the shipping country before quoting/continuing
    try {
      const issues = await findIncompatibleSellerPayments({
        sellerGroups,
        paymentBySeller: sellerCheckouts,
        country: activeAddress.country,
      })
      if (issues.length > 0) {
        for (const issue of issues) {
          setSellerPaymentMethod(issue.sellerId, null)
        }
        void queryClient.invalidateQueries({
          queryKey: ["checkout-available-methods"],
        })
        const names = issues.map((i) => i.sellerName).join(", ")
        toast.error(
          `Payment method no longer available for ${names} with this shipping country. Please choose again.`,
        )
        setShowRates(false)
        onPaymentMethodsInvalid?.()
        return
      }
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Could not verify payment methods for this address. Please try again.",
      )
      return
    }

    // Shipping is logistics-only — always priced in USD (S1), independent of payment rail
    if (!showRates) {
      setRateError("")
      try {
        const nextOptions: Record<string, ShippingOption[]> = {}
        for (const group of sellerGroups) {
          try {
            const data = await fetchRatesAsync({
              recipientAddress: {
                city: activeAddress.city,
                state: activeAddress.state,
                zipCode: activeAddress.zipCode,
                country: activeAddress.country,
              },
              cartItemIds: group.cartItemIds,
            })
            const fedExOptions =
              data.success && data.rates.length > 0
                ? data.rates.map((r) => ({
                    ...toShippingOption(r),
                    currency: "USD",
                  }))
                : []
            const options = [
              ...fedExOptions,
              makeLocalDeliveryOption("USD"),
            ]
            nextOptions[group.sellerId] = options
            const current = sellerCheckouts[group.sellerId]?.shippingOption
            if (
              !current ||
              !options.some((o) => o.serviceType === current.serviceType)
            ) {
              setSellerShippingOption(group.sellerId, options[0])
            }
          } catch {
            const local = makeLocalDeliveryOption("USD")
            nextOptions[group.sellerId] = [local]
            setSellerShippingOption(group.sellerId, local)
          }
        }
        setRateOptionsBySeller(nextOptions)
        setShowRates(true)
      } catch (error: any) {
        setRateError(
          error?.response?.data?.message ||
            "Failed to fetch shipping rates. Please check your address.",
        )
      }
    } else {
      const missing = sellerGroups.find(
        (g) => !sellerCheckouts[g.sellerId]?.shippingOption?.serviceType,
      )
      if (missing) {
        setRateError(`Select a shipping method for ${missing.sellerName}`)
        return
      }
      onNext()
    }
  }

  const settingsLink = `/profile?tab=settings&from=checkout`

  if (isProfileLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-gray-500 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your saved shipping address…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-800/80">
          Step 2 · Where it goes
        </p>
        <h2 className="mt-2 font-lexend text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Shipping
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
          Confirm the delivery address once, then choose shipping for each seller.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                First name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : "border-gray-200"}
                disabled={showRates}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium text-gray-700">
                Last name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : "border-gray-200"}
                disabled={showRates}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : "border-gray-200"}
              disabled={showRates}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
        </section>

        <section className="space-y-4">
          {!showRates && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-700">Ship to</p>
              <div className="inline-flex rounded-md border border-gray-200 p-0.5">
                <button
                  type="button"
                  disabled={!profileComplete}
                  onClick={applySavedProfileAddress}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                    addressMode === "saved"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  } ${!profileComplete ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  Saved address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddressMode("orderOnly")
                    setShowRates(false)
                  }}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                    addressMode === "orderOnly"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  This order only
                </button>
              </div>
            </div>
          )}

          {addressMode === "saved" && profileComplete ? (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2.5 text-sm text-gray-800">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="leading-relaxed">
                    <p>{activeAddress.addressLine1}</p>
                    {activeAddress.addressLine2 ? <p>{activeAddress.addressLine2}</p> : null}
                    <p>
                      {activeAddress.city}
                      {activeAddress.state ? `, ${activeAddress.state}` : ""}{" "}
                      {activeAddress.zipCode}
                    </p>
                    <p className="text-gray-500">{activeAddress.country}</p>
                    <p className="mt-2 text-gray-500">{activePhone}</p>
                  </div>
                </div>
                {!showRates && (
                  <Link
                    to={settingsLink}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                )}
              </div>
              <p className="text-gray-400 text-xs">
                Managed in Settings — used as your default for future orders.
              </p>
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
              {errors.zipCode && <p className="text-red-500 text-xs">{errors.zipCode}</p>}
            </div>
          ) : (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <StructuredAddressFields
                value={address}
                onChange={(next) => {
                  setAddress(next)
                  setErrors((prev) => ({
                    ...prev,
                    addressLine1: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  }))
                }}
                errors={{
                  addressLine1: errors.addressLine1,
                  city: errors.city,
                  state: errors.state,
                  zipCode: errors.zipCode,
                  country: errors.country,
                }}
                disabled={showRates}
                idPrefix="checkout-ship"
                showHelperText={false}
              />

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-gray-700">
                  Contact phone *
                </Label>
                <PhoneWithCountryInput
                  id="phone"
                  country={address.country}
                  value={formData.phone}
                  onChange={(phone) => handleInputChange("phone", phone)}
                  disabled={showRates}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>

              {!showRates && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="updateSavedAddress"
                    checked={updateSavedAddress}
                    onCheckedChange={(checked) =>
                      setUpdateSavedAddress(checked === true)
                    }
                  />
                  <Label
                    htmlFor="updateSavedAddress"
                    className="text-gray-600 text-xs leading-5 font-normal"
                  >
                    Also save this as my default address
                  </Label>
                </div>
              )}
            </div>
          )}

          {errors.addressLine1 && addressMode === "saved" && (
            <p className="text-red-500 text-xs">{errors.addressLine1}</p>
          )}

          {!profileComplete && addressMode === "orderOnly" && !showRates && (
            <p className="text-gray-500 text-xs">
              No default address yet.{" "}
              <Link to={settingsLink} className="text-gray-800 underline underline-offset-2">
                Add one in Settings
              </Link>{" "}
              after this order, or continue with the fields above.
            </p>
          )}
        </section>

        {showRates && (
          <div className="space-y-6 border-t border-gray-100 pt-6">
            {sellerGroups.map((group) => {
              const options = rateOptionsBySeller[group.sellerId] || []
              const selected =
                sellerCheckouts[group.sellerId]?.shippingOption || null
              return (
                <section key={group.sellerId} className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-900">
                    Shipping · {group.sellerName}
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-md">
                    {options.map((rate) => {
                      const isSelected =
                        selected?.serviceType === rate.serviceType
                      return (
                        <button
                          key={rate.serviceType}
                          type="button"
                          onClick={() =>
                            setSellerShippingOption(
                              group.sellerId,
                              toShippingOption(rate),
                            )
                          }
                          className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition ${
                            isSelected
                              ? "bg-gray-50"
                              : "bg-white hover:bg-gray-50/80"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {rate.serviceName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {typeof rate.transitDays === "number" &&
                              rate.transitDays > 0
                                ? `Est. ${rate.transitDays} days`
                                : "Standard delivery"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 tabular-nums">
                              {formatMoney(
                                rate.totalCharge,
                                rate.currency || "USD",
                              )}
                            </span>
                            <span
                              className={`h-3.5 w-3.5 rounded-full border ${
                                isSelected
                                  ? "border-gray-900 bg-gray-900"
                                  : "border-gray-300 bg-white"
                              }`}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {rateError && (
          <p className="text-red-600 text-sm">{rateError}</p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            className="text-gray-600"
          >
            Back to payment
          </Button>
          {showRates && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRates(false)}
              className="text-gray-600"
            >
              Edit address
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="bg-gray-900 text-white hover:bg-gray-800 px-5"
            disabled={isFetchingRates || isUpdating || !allPaymentsSelected}
          >
            {isFetchingRates || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                {isUpdating ? "Saving…" : "Getting rates…"}
              </>
            ) : showRates ? (
              "Continue to review"
            ) : (
              "Get shipping rates"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
