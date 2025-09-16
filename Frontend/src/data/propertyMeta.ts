export type PropertyMeta = {
    image?: string
    images?: string[]
    type?: string
    bedrooms?: number
    bathrooms?: number
    kitchen?: string // e.g., "Modular", "Open", "Fully-equipped"
    size?: string    // e.g., "2 BHK • 78 m²"
    address?: string
    amenities?: string[]
  }

export const PROPERTY_META: Record<string, PropertyMeta> = {
  '2B N1 A - 29 Shoreditch Heights': {
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  },
  '3A SE - Greenwich Light Loft': {
    type: 'Loft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  '4C W1 - Marylebone Mews': {
    type: 'Mews House',
    image: 'https://picsum.photos/seed/marylebone/800/500'
  }
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
export const FALLBACK_TYPE = 'Property'
