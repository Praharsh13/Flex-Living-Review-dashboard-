import { Review } from "./review.js"

//To make each review normalised
export function normalizeHostawayReview(r) {

    const cats = Array.isArray(r.reviewCategory) ? r.reviewCategory : []
    //Make average if there is no rating given to show in frontend
    const avg = cats.length ? cats.reduce((s, c) => s + (c.rating ?? 0), 0) / cats.length : null 

    return {
        id: String(r.id), // id identifier
        type: r.type,
        status: r.status,
        rating: r.rating ?? avg, // avg if not rating
        categories: cats.map(c => ({ key: c.category, rating: c.rating ?? null })), //show in key value pair
        comment: r.publicReview ?? '',
        guest: r.guestName ?? 'Guest',
        listing: r.listingName ?? 'Unknown Listing', // 
        channel: 'hostaway',
        submittedAt: r.submittedAt ? new Date(r.submittedAt.replace(' ', 'T')) : null
        
        }
}


//Function that return reviews length of hostway and each listing reviews
    export async function listOfHostwayReview(){
        const reviews=await Review.find({channel:'hostaway'})
        .sort({submittedAt:1})
        .lean()

        console.log(`${reviews.length} is getting from database`)

        const groupedByListing=groupByListing(reviews)

        return{
            status:'success',
            total:reviews.length,
            groupedByListing,
            result:reviews
        }
    }

    export async function listPublicApprovedReviews() {
        const rows = await Review.find({ channel: 'hostaway', approved: true })
          .sort({ submittedAt: 1 })
          .lean()
      
        const groupedByListing = rows.reduce((acc, r) => {
          (acc[r.listing] ||= []).push(r)
          return acc
        }, {})
      
        return {
          status: 'success',
          total: rows.length,
          groupedByListing,
          result: rows
        }
      }

//toggle the flag for review if it is public or not
    export async function toggleApproved(id){
        const key=`hostaway:${String(id)}`
        const review=await Review.findOne({key})
        if(!review){
            console.log("No review found")
        }
        review.approved=!review.approved
        await review.save()

        return {success:true,id:String(id),approved:review.approved}
    }




//To make listing of each group that help to find listing of each property
// {
//     "2B N1 A - 29 Shoreditch Heights": [ review1, review2, ... ],
//     "3A SE - Greenwich Light Loft": [ review3, review4, ... ]
//   }
export function groupByListing(reviews=[]){
    const grouped={}
    for(const r of reviews){
        if(!grouped[r.listing]){
            grouped[r.listing]=[]
        }
        grouped[r.listing].push(r) 
        
    }
    return grouped
}
