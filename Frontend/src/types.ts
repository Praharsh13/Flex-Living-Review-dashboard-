//Defining types

export type Category=[{
    key:string;
    rating:number | null;
} ]

export type Review = {
    key?: string
    id: string
    type: string
    status: string
    rating: number | null
    categories: Category
    comment: string
    guest: string
    listing: string
    channel: 'hostaway' | string
    submittedAt: string 
    approved?: boolean
  }
  
  export type ReviewsPayload = {
    status: 'success' | 'error'
    total: number
    groupedByListing: Record<string, Review[]>
    result: Review[]
  }

  
  
  export type Filters = {
    listing: string
    channel: string
    category: string
    minRating: number
    from: string
    to: string
    search: string
    sortBy: 'date' | 'rating'
    sortDir: 'asc' | 'desc'
  }