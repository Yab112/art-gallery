export interface ArtworkDimensions {
    height: string
    width: string
    depth?: string
  }
  
  export interface ArtworkFormData {
    // Section 1: Information about the artwork
    typeOfArtwork: string
    technique: string
    artist: string
    support: string
    titleOfArtwork: string
    state: string
    yearOfArtwork: string
    dimensions: ArtworkDimensions
    isFramed: string
    weight: string
    handDeliveryAccepted: string
    origin: string
    yearOfAcquisition: string
    proofOfOrigin: File | null
  
    // Section 2: Description
    description: string
  
    // Section 3: Photos
    photos: (File | null)[]
  
    // Section 4: Price
    desiredPrice: string
    acceptPriceNegotiation: string
  
    // Section 5: Banking information
    accountHolder: string
    iban: string
    bicCode: string
    acceptTermsOfSale: boolean
    giveSalesMandate: boolean
  }
  
  export interface PhotoUploadSlot {
    id: number
    label: string
    file: File | null
  }
  
  export interface SelectOption {
    value: string
    label: string
  }
  