const logger = require("../../services/logger.service")
const authService = require("../auth/auth.service")
// const userService = require('../user/user.service')
const socketService = require("../../services/socket.service")
const orderService = require("./order.service.js")

async function getOrdersById(req, res) {
  try {
    const isBuyer = JSON.parse(req.query.params)
    const orders = await orderService.queryByRole(isBuyer)
    res.json(orders)
  } catch (err) {
    logger.error("order.controller: Failed to get orders", err)
    res.status(500).send({ err: "Failed to get orders" })
  }
}

async function addOrder(req, res) {
  var loggedinUser = authService.validateToken(req.cookies.loginToken)
  try {
    const order = req.body
    const addedOrder = await orderService.add(order)
    res.json(addedOrder)
    socketService.broadcast({
      type: "hire-for-gig-request",
      data: order,
      userId: loggedinUser._id,
    })
    socketService.emitToUser({
      type: "hire-for-gig-request",
      data: order,
      userId: order.seller._id,
    })
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
    console.log(gigId)
    console.log(status.status)
    const updatedOrder = await orderService.updateStatus(gigId, status.status)
    res.json(updatedOrder)
  } catch (err) {
    logger.error("order.controller: Failed to update order status", err)
    res.status(500).send({ err: "Failed to update order status" })
  }
}

module.exports = {
  getOrdersById,
  addOrder,
  updateOrder,
  updateOrderStatus,
}
