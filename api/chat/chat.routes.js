const express = require('express')

const {  getChatRoomsById, addChatRoom, addNewMsg } = require('./chat.controller')
const router = express.Router()

//
router.get('/', getChatRoomsById)

//
router.post('/', addChatRoom)

//
router.put('/', addNewMsg)


module.exports = router