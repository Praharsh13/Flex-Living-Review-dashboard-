import { listOfHostwayReview,toggleApproved ,listPublicApprovedReviews} from "../models/normalisedHostawayReview.js";

    export async function getHostawayReviews(req, res) {
        try {
            const payload = await listOfHostwayReview()
        res.status(200).json(payload)
        } catch (error) {
        res.status(400).json({error:"Not able to fetch hostway reviews"})
        }
    }


    export async function postToggleApproval(req, res) {
        try {
            const { id } = req.params
            if (!id) return res.status(400).json({ error: 'missing id' })
            const result = await toggleApproved(id)
            if (!result) return res.status(404).json({ error: 'review not found' })
            res.status(201).json(result)
        } catch (error) {

            res.status(400).json({error:"Not able to toggle the review approval"})
            
        }
    }
    export async function getPublicApprovedReviews(req, res) {
        try {
          const payload = await listPublicApprovedReviews()
          return res.json(payload)
        } catch (e) {
          console.error(e)
          return res.status(500).json({ error: 'Failed to fetch public reviews' })
        }
      }
    