import type { ReviewsPayload } from "../types"
const API =import.meta.env.VITE_API_URL

function authHeaders(): HeadersInit {
    const t = localStorage.getItem('token')
    return t ? { Authorization: `Bearer ${t}` } : {}
  }
  

  export async function login(email: string, password: string) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Invalid credentials')
    return res.json() as Promise<{ ok: true; token: string; user: { email: string; role: string } }>
  }


export let fetchReviews=async():Promise<ReviewsPayload>=>{
    const res=await fetch(`{API}/api/reviews/hostaway`,{
        headers:authHeaders()
    })
    if(!res.ok){
        throw new Error(`Failed to fetch API`)
    }
    return res.json() 

    }


     


export let toggleAproval=async(id:string)=>{
    const res=await fetch(`{API}/api/reviews/approve/${id}`,{
        method:'POST',
        headers:authHeaders()
    })
    if(!res.ok){
        throw new Error(`Failed to fetch API`)
    }
    return res.json() as 
    Promise<{success:true;
    id:string;
    approved:boolean    
     }>
}    


export async function fetchPublicReviews(): Promise<ReviewsPayload> {
    const res = await fetch('{API}/api/reviews/publicreviews')
    if (!res.ok) throw new Error('Failed to fetch public reviews')
    return res.json()
  }