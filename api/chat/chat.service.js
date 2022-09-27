const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const asyncLocalStorage = require('../../services/als.service')
const ObjectId = require('mongodb').ObjectId


async function query(userId) {
  try {
    const collection = await dbService.getCollection('chat')
    const chatRooms = await collection.find({ participents: { $in: [userId] } }).toArray()
    // console.log('chatRooms', chatRooms)

    return chatRooms
  } catch (err) {
    logger.error('chat.service: Cannot get chatRooms', err)
    throw err
  }
}

async function add(chatRoom) {
  try {
    chatRoom.msgs = []

    const collection = await dbService.getCollection('chat')
    const addedChatRoom = await collection.insertOne(chatRoom)

    return addedChatRoom
  } catch (err) {
    logger.error('chat.service: Cannot add chatRoom', err)
    throw err
  }
}

async function addMsg(msg) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const chatId = msg.chatRoomId
        delete msg.chatRoomId
        msg.fullname = loggedinUser.fullname
        msg.createdAt = Date.now()

        const collection = await dbService.getCollection('chat')
        await collection.findOneAndUpdate({_id: ObjectId(chatId)}, {$push: {msgs: msg}} )

        return msg
    } catch (err) {
        logger.error('chat.service: Cannot add msg', err)
        throw err
    }
}

module.exports = {
  query,
  add,
  addMsg,
}
