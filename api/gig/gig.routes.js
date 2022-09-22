const express = require('express')

const { getGigs, getGigById, addGig, updateGig, removeGig, addReview } = require('./gig.controller')
const router = express.Router()

// Get Gigs List
router.get('/', getGigs)

// Get Gig Item
router.get('/:id', getGigById)

// Add New Gig Item
router.post('/', addGig)

// Update Gig Item
router.put('/:id', updateGig)

// Delete Gig Item
router.delete('/:id', removeGig)

// Add Review
router.put('/review/:id', addReview)


module.exports = router