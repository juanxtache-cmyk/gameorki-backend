const express = require("express")
const router = express.Router()
const postController = require("../controllers/postController")
const { verifyToken } = require("../middleware/auth")

// Rutas públicas
router.get("/thread/:threadId", postController.getPostsByThread)

// Rutas protegidas
router.post("/thread/:threadId", verifyToken, postController.createPost)
router.put("/:id", verifyToken, postController.updatePost)
router.delete("/:id", verifyToken, postController.deletePost)
router.patch("/:id/accept", verifyToken, postController.toggleAcceptedAnswer)
router.patch("/:id/like", verifyToken, postController.toggleLike)

module.exports = router
