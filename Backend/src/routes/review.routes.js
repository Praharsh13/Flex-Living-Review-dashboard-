import { Router } from 'express'
import { getHostawayReviews, postToggleApproval } from '../controller/review.controller.js'

const router = Router()
router.get('/hostaway', getHostawayReviews)
router.post('/approve/:id', postToggleApproval)
export default router
