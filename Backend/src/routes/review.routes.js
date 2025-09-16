import { Router } from 'express'
import { getHostawayReviews, getPublicApprovedReviews, postToggleApproval } from '../controller/review.controller.js'
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js'

const router = Router()
router.get('/hostaway', getHostawayReviews)
router.post('/approve/:id',requireAuth,requireAdmin, postToggleApproval)
router.get('/publicreviews',getPublicApprovedReviews)
export default router
