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

        const { basicPrice, basicDaysToMake, rate, category, search } = filterBy

        if (category && category !== 'trending') {
            gigs = gigs.filter(gig => gig.category === category)
        }

        if (category === 'trending') {
            console.log("here");
            console.log(gigs);
            gigs.sort((a, b) => b.viewsCount - a.viewsCount)
            console.log(gigs);
        }

        if (search) {
            gigs = gigs.filter(gig => gig.title.includes(search))
        }

        if (basicPrice) {
            gigs = gigs.filter(gig => gig.plans.basicPrice <= basicPrice)
        }

        if (basicDaysToMake) {
            gigs = gigs.filter(gig => gig.plans.basicDaysToMake <= basicDaysToMake)
        }

        if (rate) {
            gigs = gigs.filter(gig => gig.owner.rate >= rate)
        }

        if (filterBy.owner) {
            gigs = gigs.filter(gig => {
                return gig.owner._id === filterBy.owner
            })
        }
        // console.log(gigs)

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
        const gig = await collection.findOneAndUpdate({ _id: ObjectId(gigId) }, { $inc: { viewsCount: 1 } }, { returnDocument: 'after' })
        console.log(gig.value);
        return gig.value
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
        gig.viewsCount = 0
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

async function updateReview(gigId, review) {
    try {

        const id = ObjectId(gigId)
        review.createdAt = Date.now()

        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: id }, { $push: { reviews: review } })

        return review
    } catch (err) {
        logger.error(`gig.service: Cannot update gig ${gigId}: `, err)
        throw err
    }
}


module.exports = {
    query,
    remove,
    getById,
    add,
    update,
    updateReview
}