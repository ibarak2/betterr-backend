const express = require('express')
const { login, signup, logout } = require('./auth.controller')

const router = express.Router()

// Login
router.post('/login', login)

// Sign Up
router.post('/signup', signup)

// Logout
router.post('/logout', logout)

module.exports = router