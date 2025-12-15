const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cartController")
const { verifyToken } = require("../middleware/auth")

// Todas las rutas requieren autenticación
router.use(verifyToken)

router.get("/", cartController.getCart)
router.put("/", cartController.updateCart)
router.delete("/", cartController.clearCart)

module.exports = router
