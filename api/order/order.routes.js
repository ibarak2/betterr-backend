const express = require('express')

const { getOrdersById, addOrder, updateOrder, updateOrderStatus } = require('./order.controller')
const router = express.Router()

//
router.get('/', getOrdersById)

//
router.post('/', addOrder)

//
router.put('/:id', updateOrder)

//
router.put('/status/:id', updateOrderStatus)




module.exports = router
