const logger = require("../../services/logger.service")
const authService = require("../auth/auth.service")
// const userService = require('../user/user.service')
const socketService = require("../../services/socket.service")
const orderService = require("./order.service.js")

async function getOrdersById(req, res) {
  try {
    const filter = JSON.parse(req.query.params)
    // console.log("filter", filter);
    const orders = await orderService.queryByRole(filter)
    res.json(orders)
  } catch (err) {
    logger.error("order.controller: Failed to get orders", err)
    res.status(500).send({ err: "Failed to get orders" })
  }
}

async function addOrder(req, res) {
  try {
    const order = req.body
    const addedOrder = await orderService.add(order)
    res.json(addedOrder)
  } catch (err) {
    logger.error("order.controller: Failed to add orders", err)
    res.status(500).send({ err: "Failed to add orders" })
  }
}

async function updateOrder(req, res) {
  try {
    const order = req.body
    const updatedOrder = await orderService.update(order)
    res.json(updatedOrder)
  } catch (err) {
    logger.error("order.controller: Failed to update orders", err)
    res.status(500).send({ err: "Failed to update orders" })
  }
}

async function updateOrderStatus(req, res) {
  try {
    const gigId = req.params.id
    const status = req.body
    // console.log(gigId)
    // console.log(status.status)
    const updatedOrder = await orderService.updateStatus(gigId, status.status)
    res.json(updatedOrder)
  } catch (err) {
    logger.error("order.controller: Failed to update order status", err)
    res.status(500).send({ err: "Failed to update order status" })
  }
}

async function getAnalytics(req, res) {
  try {
    const analytics = await orderService.analytics()
    res.json(analytics)
  } catch (err) {
    logger.error('gig.controller: Failed to getAnalytics', err)
    res.status(500).send({ err: 'Failed to getAnalytics' })
  }
}

module.exports = {
  getOrdersById,
  addOrder,
  updateOrder,
  updateOrderStatus,
  getAnalytics
}
