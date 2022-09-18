const gigService = require('./gig.service.js')
const logger = require('../../services/logger.service')

// Get Gigs
async function getGigs(req, res) {
    try {
        logger.debug('gig.controller: Getting Gigs')
        let filterBy = JSON.parse(req.query.params)

        console.log("filterBy:", filterBy);
        const gigs = await gigService.query(filterBy)
        res.json(gigs)
    } catch (err) {
        logger.error('gig.controller: Failed to get gigs', err)
        res.status(500).send({ err: 'Failed to get gigs' })
    }
}

// Get Gig by ID 
async function getGigById(req, res) {
    try {
        const gigId = req.params.id
        const gig = await gigService.getById(gigId)
        res.json(gig)
    } catch (err) {
        logger.error('gig.controller: Failed to get gig', err)
        res.status(500).send({ err: 'Failed to get gig' })
    }
}

// Add Gig 
async function addGig(req, res) {
    try {
        const gig = req.body
        const addedGig = gigService.add(gig)
        res.json(addedGig)
    } catch (err) {
        logger.error('gig.controller: Failed to add gig', err)
        res.status(500).send({ err: 'Failed to add gig' })
    }
}

// Update Gig
async function updateGig(req, res) {
    try {
        const gig = req.body
        const updatedGig = await gigService.update(gig)
        res.json(updatedGig)
    } catch (err) {
        logger.error('gig.controller: Failed to update gig', err)
        res.status(500).send({ err: 'Failed to update gig' })
    }
}

// Delete Gig
async function removeGig(req, res) {
    try {
        const gigId = req.params.id
        const removedGigId = await gigService.remove(gigId)
        res.send(removedGigId)
    } catch (err) {
        logger.error('gig.controller: Failed to remove gig', err)
        res.status(500).send({ err: 'Failed to remove gig' })
    }
}


module.exports = {
    getGigs,
    removeGig,
    getGigById,
    addGig,
    updateGig
}