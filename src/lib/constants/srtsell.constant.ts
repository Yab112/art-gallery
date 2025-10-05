import type { SelectOption } from "@/types/selart.type";

export const ARTWORK_TYPES: SelectOption[] = [
  { value: "painting", label: "Painting" },
  { value: "sculpture", label: "Sculpture" },
  { value: "photography", label: "Photography" },
  { value: "drawing", label: "Drawing" },
  { value: "print", label: "Print" },
  { value: "mixed-media", label: "Mixed Media" },
  { value: "digital", label: "Digital Art" },
];

export const SUPPORT_TYPES: SelectOption[] = [
  { value: "canvas", label: "Canvas" },
  { value: "paper", label: "Paper" },
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "stone", label: "Stone" },
  { value: "other", label: "Other" },
];

export const ARTWORK_STATES: SelectOption[] = [
  { value: "excellent", label: "Excellent" },
  { value: "very-good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "restoration-needed", label: "Restoration Needed" },
];

export const YES_NO_OPTIONS: SelectOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const ORIGIN_OPTIONS: SelectOption[] = [
  { value: "gallery", label: "Gallery" },
  { value: "auction", label: "Auction" },
  { value: "artist", label: "Directly from Artist" },
  { value: "private", label: "Private Collection" },
  { value: "inheritance", label: "Inheritance" },
  { value: "other", label: "Other" },
];

export const PRICE_NEGOTIATION_OPTIONS: SelectOption[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes, I accept price negotiation" },
];

export const COMMISSION_RATE = 0.3; // 30%
export const TAX_RATE = 0.0; // Adjust based on requirements

export const MAX_PHOTOS = 5;
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
export const ACCEPTED_DOCUMENT_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

export const FORM_TIPS = `Do not hesitate to send any additional information that could help us in our decision making process: description of the piece, how you acquired it, certificate of authenticity, a missing piece / unwanted mark on the work, restoration...`;
