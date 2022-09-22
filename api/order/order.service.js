const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')


async function queryByRole(isBuyer) {
    try {

        const { loggedinUser } = asyncLocalStorage.getStore()
        const id = loggedinUser._id
        console.log(id);

        const collection = await dbService.getCollection('order')
        const orders = (isBuyer) ? await collection.aggregate(
            { $match: { "buyer._id": id } },
            { $unwind: "$buyer" },
            {
                $match: {
                    "buyer._id": id
                }
            }
        ).toArray() :
            await collection.aggregate(
                { $match: { "seller._id": id } },
                { $unwind: "$seller" },
                {
                    $match: {
                        "seller._id": id
                    }
                }).toArray()
        console.log("orders", orders);
        return orders
    } catch (err) {
        logger.error('order.service: Cannot get buyer`s Orders ', err)
        throw err
    }

}

async function add(order) {
    try {

        order.status = 'pending'
        order.createdAt = Date.now()
        logger.debug(order)

        const collection = await dbService.getCollection('order')
        const addedOrder = await collection.insertOne(order)

        return addedOrder
    } catch (err) {
        logger.error('order.service: Cannot add Order', err)
        throw err
    }
}

async function updateStatus(orderId, newStatus) {
    try {
        const collection = await dbService.getCollection('order')
        const updatedOrder = await collection.findOneAndUpdate({ _id: ObjectId(orderId) }, { $set: { status: newStatus } }, { returnDocument: 'after' })
        return updatedOrder.value
    } catch (err) {
        logger.error('order.service: Cannot update Order status', err)
        throw err
    }
}

async function update(order) {

}

module.exports = {
    queryByRole,
    add,
    update,
    updateStatus
}