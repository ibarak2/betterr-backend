const logger = require("./logger.service")

var gIo = null

function setupSocketAPI(http) {
  gIo = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  })

  gIo.on("connection", (socket) => {
    logger.info(`New connected socket [socket.id: ${socket.id}]`)
    socket.on("disconnect", () => {
      logger.info(`Socket disconnected [id: ${socket.id}]`)
    })
    socket.on("chat-set-room", (room) => {
      if (socket.myRoom === room) return
      if (socket.myRoom) {
        socket.leave(socket.myRoom)
        logger.info(
          `Socket is leaving room ${socket.myRoom} [id: ${socket.id}]`
        )
      }
      socket.join(room)
      socket.myRoom = room
    })

    socket.on("set-user-socket", (userId) => {
      console.log(`Setting socket.userId = ${userId} for socket [socket.id: ${socket.id}]`);
      logger.info(
        `Setting socket.userId = ${userId} for socket [socket.id: ${socket.id}]`
      )
      socket.userId = userId
    })

    socket.on("unset-user-socket", () => {
      logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
    })

    socket.on("new-order-request", (sellerId) => {
      logger.info(`New order sent to ${sellerId}`)

      emitToUser({ type: "new-order-recieved", data: "New Order Recieved", userId: sellerId })
    })

    socket.on("order-change-status", (miniOrder) => {
      logger.info(`Change Order Status`)

      emitToUser({ type: "on-order-changed-status", data: { txt: miniOrder.txt, orderId: miniOrder._id, status: miniOrder.status }, userId: miniOrder.userId })
    })

  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to("watching:" + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  if (!userId) return
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    logger.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
    )
    socket.emit(type, data)

  } else {
    logger.info(`No active socket for user: ${userId}`)
    // _printSockets()
  }
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
  userId = userId.toString()
  // console.log("GETTING TO BROADCAST IN SOCKET SERVICE")

  logger.info(`Broadcasting event: ${type}`)
  const excludedSocket = await _getUserSocket(userId)

  if (room && excludedSocket) {
    logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    logger.info(`Broadcast to all excluding user: ${userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    logger.info(`Emit to room: ${room}`)
    gIo.to(room).emit(type, data)
  } else {
    logger.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId === userId)
  return socket
}

async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  return sockets
}

async function _printSockets() {
  const sockets = await _getAllSockets()
  // console.log(`Sockets: (count: ${sockets.length}):`)
  sockets.forEach(_printSocket)
}

function _printSocket(socket) {
  // console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
}
