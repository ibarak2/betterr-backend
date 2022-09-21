const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')


async function query(filterBy) {
    try {
        logger.debug('gig.service: Finding Gigs')

        const criteria = {}

        const collection = await dbService.getCollection('gig')
        var gigs = await collection.find(criteria).toArray()

        const { maxPrice, daysToMake, rate, category } = filterBy

        if (category) {
            gigs = gigs.filter(gig => gig.category === category)
        }

        if (maxPrice) {
            gigs = gigs.filter(gig => gig.price <= maxPrice)
        }

        if (daysToMake) {
            gigs = gigs.filter(gig => gig.daysToMake <= daysToMake)
        }

        if (rate) {
            gigs = gigs.filter(gig => gig.rate >= rate)
        }
        if (filterBy.owner) {
            gigs = gigs.filter(gig => {
                console.log(gig.owner.fullname === filterBy.owner)
                return gig.owner.fullname === filterBy.owner})
        }
        console.log(gigs)

        return gigs
    } catch (err) {
        logger.error('gig.service: Cannot find gigs: ', err)
        throw err
    }
}

async function getById(gigId) {
    try {
        logger.debug(`gig.service: Finding Gig`)

        const collection = await dbService.getCollection('gig')
        const gig = await collection.findOne({ _id: ObjectId(gigId) })

        return gig
    } catch (err) {
        logger.error('gig.service: Cannot find gig: ', err)
        throw err
    }
}

async function add(gig) {
    try {
        logger.debug('gig.service: Adding Gig')

        const { loggedinUser } = asyncLocalStorage.getStore()
        delete loggedinUser.balance
        console.log('loggeinUser', loggedinUser);
        gig.owner = { ...loggedinUser }
        gig.reviews = []
        gig.likedByUsers = []
        console.log(gig);

        const collection = await dbService.getCollection('gig')
        const addedGig = await collection.insertOne(gig)

        return addedGig
    } catch (err) {
        logger.error('gig.service: Cannot add gigs: ', err)
        throw err
    }
}

async function update(gig) {
    try {
        logger.debug('gig.service: Updating Gig')

        const id = ObjectId(gig._id)
        delete gig._id
        const collection = await dbService.getCollection('gig')
        const updatedGig = await collection.updateOne({ _id: id }, { $set: { ...gig } })

        return updatedGig
    } catch (err) {
        logger.error(`gig.service: Cannot update gig ${gig._id}: `, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        logger.debug(`gig.service: Removing Gig ${gigId}`)

        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ _id: ObjectId(gigId) })

        return gigId
    } catch {
        logger.error(`gig.service: Cannot remove gig ${gigId}: `, err)
        throw err
    }
}


module.exports = {
    query,
    remove,
    getById,
    add,
    update
}