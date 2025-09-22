import type { Category, Artwork } from "./artwork-types"

export const CATEGORIES: Category[] = [
  {
    id: "contemporary",
    name: "Contemporary Art",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
  {
    id: "painting",
    name: "Painting",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
  {
    id: "street",
    name: "Street Art",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
  {
    id: "photography",
    name: "Photography",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
  {
    id: "emerging",
    name: "Emerging Art",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
  {
    id: "20th-century",
    name: "20th-Century Art",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dB6vGiWEwmdFtlBWVkHhm6RA59WzaC.png",
  },
]

export const ARTWORKS: Artwork[] = [
  {
    id: "1",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VOZ7s8LCylaCHmmeg72bESxON44Y6E.png",
    title: "Abraham Casting Out Hagar and Ishmael",
    artist: "Rembrandt van Rijn",
    price: "US$68,500",
    year: "1637",
    medium: "Increased Interest",
    dimensions: "M.S. Rau",
    seller: "M.S. Rau",
  },
  {
    id: "2",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VOZ7s8LCylaCHmmeg72bESxON44Y6E.png",
    title: "Unique",
    artist: "Salvador Dalí",
    price: "US$98,500",
    year: "",
    medium: "Painting",
    dimensions: "",
    seller: "",
  },
  {
    id: "3",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VOZ7s8LCylaCHmmeg72bESxON44Y6E.png",
    title: "Illumination Shadows",
    artist: "RETNA",
    price: "US$14,250",
    year: "2020",
    medium: "",
    dimensions: "",
    seller: "APC Gallery",
  },
  {
    id: "4",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VOZ7s8LCylaCHmmeg72bESxON44Y6E.png",
    title: "Aida (Study)",
    artist: "RETNA",
    price: "US$18,500",
    year: "2016",
    medium: "",
    dimensions: "",
    seller: "APC Gallery",
  },
  {
    id: "5",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VOZ7s8LCylaCHmmeg72bESxON44Y6E.png",
    title: "Squid",
    artist: "Susan Meyer",
    price: "US$400",
    year: "2024",
    medium: "",
    dimensions: "Drawing Rooms",
    seller: "Drawing Rooms",
  },
]

export const TOTAL_ARTWORKS = 2296363

export const FILTER_OPTIONS = {
  rarity: [
    { id: "unique", label: "Unique", count: 1234567 },
    { id: "limited", label: "Limited Edition", count: 456789 },
    { id: "open", label: "Open Edition", count: 234567 },
  ],
  medium: [
    { id: "painting", label: "Painting", count: 567890 },
    { id: "photography", label: "Photography", count: 345678 },
    { id: "sculpture", label: "Sculpture", count: 123456 },
    { id: "print", label: "Print", count: 234567 },
  ],
  priceRange: [
    { id: "under-1k", label: "Under $1,000", count: 123456 },
    { id: "1k-5k", label: "$1,000 - $5,000", count: 234567 },
    { id: "5k-25k", label: "$5,000 - $25,000", count: 345678 },
    { id: "25k-plus", label: "$25,000+", count: 456789 },
  ],
}
