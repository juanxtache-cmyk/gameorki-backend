const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { verifyToken } = require("../middleware/auth")

// Rutas públicas
router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/verify-code", authController.verifyCode)
router.post("/reset-password", authController.resetPassword)

// Rutas protegidas
router.get("/profile", verifyToken, authController.getProfile)

module.exports = router
