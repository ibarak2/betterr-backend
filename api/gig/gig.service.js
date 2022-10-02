const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy) {
  try {

    const criteria = {}

    const collection = await dbService.getCollection("gig")
    var gigs = await collection.find(criteria).toArray()

    const { minPrice, maxPrice, sort, basicDaysToMake, rate, category, search } = filterBy

    if (category && category !== "trending") {
      gigs = gigs.filter((gig) => gig.category === category)
    }

    if (category === "trending") {
      gigs.sort((a, b) => b.viewsCount - a.viewsCount)
    }

    if (search) {
      gigs = gigs.filter((gig) => gig.title.includes(search))
    }
    if (sort === 'new-arrival') {
      gigs.sort((a, b) => b.createdAt - a.createdAt)
    }
    if (sort === 'rating') {
      gigs.sort((a, b) => b.owner.rate - a.owner.rate)
    }
    if (minPrice) {
      gigs = gigs.filter((gig) => gig.plans.basicPrice >= minPrice)
    }
    if (maxPrice) {
      gigs = gigs.filter((gig) => gig.plans.basicPrice <= maxPrice)
    }
    if (basicDaysToMake) {
      gigs = gigs.filter((gig) => gig.plans.basicDaysToMake <= basicDaysToMake)
    }

    if (rate) {
      gigs = gigs.filter((gig) => gig.owner.rate >= rate)
    }

    if (filterBy.owner) {
      gigs = gigs.filter((gig) => {
        return gig.owner._id === filterBy.owner
      })
    }

    return gigs
  } catch (err) {
    logger.error("gig.service: Cannot find gigs: ", err)
    throw err
  }
}

async function getById(gigId) {
  try {
    const collection = await dbService.getCollection("gig")
    const gig = await collection.findOneAndUpdate(
      { _id: ObjectId(gigId) },
      { $inc: { viewsCount: 1 } },
      { returnDocument: "after" }
    )
    return gig.value
  } catch (err) {
    logger.error("gig.service: Cannot find gig: ", err)
    throw err
  }
}

async function add(gig) {
  try {
    logger.debug("gig.service: Adding Gig")

    const { loggedinUser } = asyncLocalStorage.getStore()
    delete loggedinUser.balance
    gig.owner = { ...loggedinUser }
    gig.reviews = []
    gig.likedByUsers = []
    gig.viewsCount = 0

    const collection = await dbService.getCollection("gig")
    const addedGig = await collection.insertOne(gig)

    return addedGig
  } catch (err) {
    logger.error("gig.service: Cannot add gigs: ", err)
    throw err
  }
}

async function update(gig) {
  try {
    logger.debug(`gig.service: Updating Gig ${gig._id}`)

    let updatedGig
    const id = ObjectId(gig._id)
    delete gig._id

    const { loggedinUser } = asyncLocalStorage.getStore()

    const collection = await dbService.getCollection("gig")
    if (loggedinUser.isAdmin) {
      updatedGig = await collection.updateOne({ _id: id }, { $set: { ...gig } })
    }
    if (!loggedinUser.isAdmin) {
      updatedGig = await collection.updateOne(
        { _id: id, "owner._id": loggedinUser._id },
        { $set: { ...gig } }
      )
    }

    return updatedGig
  } catch (err) {
    logger.error(`gig.service: Cannot update gig ${gig._id}: `, err)
    throw err
  }
}

async function remove(gigId) {
  try {
    logger.debug(`gig.service: Removing Gig ${gigId}`)

    const criteria = { _id: ObjectId(gigId) }

    const { loggedinUser } = asyncLocalStorage.getStore()

    const collection = await dbService.getCollection("gig")
    if (loggedinUser.isAdmin) {
      await collection.deleteOne(criteria)
    }
    if (!loggedinUser.isAdmin) {
      await collection.deleteOne({
        _id: ObjectId(gigId),
        "owner._id": loggedinUser._id,
      })
    }
    // criteria["owner._id"] = ObjectId(loggedinUser._id)

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

    const collection = await dbService.getCollection("gig")
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
  updateReview,
}
