const logger = require("../../services/logger.service")
const authService = require("../auth/auth.service")
const chatService = require("../chat/chat.service")
const socketService = require("../../services/socket.service")

async function getChatRoomsById(req, res) {
    try {
        const userId = req.query.params
        const chatRooms = await chatService.query(userId)
        res.json(chatRooms)
    } catch (err) {
        logger.error("chat.controller: Failed to get chat-rooms", err)
        res.status(500).send({ err: "Failed to get chat-rooms" })
    }
}

async function addChatRoom(req, res) {
    try {
        const chatRoom = req.body
        console.log('chatRoom', chatRoom);
        const addedChatRoom = await chatService.add(chatRoom)
        res.json(addedChatRoom)
    } catch (err) {
        logger.error("chat.controller: Failed to add chat-room", err)
        res.status(500).send({ err: "Failed to add chat-room" })
    }
}

async function addNewMsg(req, res) {
    try {
        const msg = req.body.params
        // console.log('backkk msg', msg);
        const addedMsg = await chatService.addMsg(msg)
        res.json(addedMsg)
    } catch (err) {
        logger.error("chat.controller: Failed to add msg", err)
        res.status(500).send({ err: "Failed to add msg" })
    }
}

module.exports = {
    getChatRoomsById,
    addChatRoom,
    addNewMsg,
}