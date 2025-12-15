const express = require("express")
const router = express.Router()
const forumController = require("../controllers/forumController")
const { verifyToken, checkRole } = require("../middleware/auth")

// Rutas públicas
router.get("/", forumController.getAllForums)
router.get("/:id", forumController.getForumById)

// Rutas protegidas (solo admin)
router.post("/", verifyToken, checkRole(["admin"]), forumController.createForum)
router.put("/:id", verifyToken, checkRole(["admin"]), forumController.updateForum)
router.delete("/:id", verifyToken, checkRole(["admin"]), forumController.deleteForum)

module.exports = router
