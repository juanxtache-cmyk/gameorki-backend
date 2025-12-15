const express = require("express")
const router = express.Router()
const threadController = require("../controllers/threadController")
const { verifyToken, checkRole } = require("../middleware/auth")

// Rutas públicas
router.get("/", threadController.getAllThreads)
router.get("/:id", threadController.getThreadById)

// Rutas protegidas
router.post("/", verifyToken, threadController.createThread)
router.put("/:id", verifyToken, threadController.updateThread)
router.delete("/:id", verifyToken, threadController.deleteThread)

// Rutas para admin/moderador
router.patch("/:id/pin", verifyToken, checkRole(["admin", "moderator"]), threadController.togglePinThread)
router.patch("/:id/lock", verifyToken, checkRole(["admin", "moderator"]), threadController.toggleLockThread)

module.exports = router
