const express = require('express')

const { getOrdersById, addOrder, updateOrderStatus, getAnalytics } = require('./order.controller')
const router = express.Router()

// Get Orders List by User ID
router.get('/', getOrdersById)

// Add new Order
router.post('/', addOrder)

// Update Order Status
router.put('/status/:id', updateOrderStatus)

// Get Analytics Information
router.get('/analytics', getAnalytics)



module.exports = router
