const express = require('express')

const { getOrdersById, addOrder, updateOrder, updateOrderStatus, getAnalytics } = require('./order.controller')
const router = express.Router()

//
router.get('/', getOrdersById)

//
router.post('/', addOrder)

//
router.put('/:id', updateOrder)

//
router.put('/status/:id', updateOrderStatus)

// Get Analytics
router.get('/analytics', getAnalytics)



module.exports = router
