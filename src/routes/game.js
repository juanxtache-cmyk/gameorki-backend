const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

// Rutas públicas
router.get("/", gameController.getAllGames);
router.get("/featured", gameController.getFeaturedGames);
router.get("/categories", gameController.getCategories);
router.get("/search", gameController.searchGames);
router.get("/category/:category", gameController.getGamesByCategory);
router.get("/:id", gameController.getGameById);

// Rutas administrativas
router.post("/", gameController.createGame);
router.put("/:id", gameController.updateGame);
router.delete("/:id", gameController.deleteGame);
router.patch("/:id/stock", gameController.updateStock);

module.exports = router;