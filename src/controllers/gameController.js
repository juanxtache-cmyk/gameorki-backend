const Game = require("../entities/Game");

// Función auxiliar para obtener el repositorio
const getGameRepository = () => {
  return global.AppDataSource ? global.AppDataSource.getRepository(Game) : null;
};

class GameController {
  // Obtener todos los juegos
  async getAllGames(req, res) {
    try {
      const gameRepository = getGameRepository();
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const games = await gameRepository.find({
        where: { active: true },
        order: { createdAt: "DESC" }
      });
      
      res.json({
        success: true,
        data: games,
        message: "Juegos obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener juegos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Obtener un juego por ID
  async getGameById(req, res) {
    try {
      const { id } = req.params;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const game = await gameRepository.findOne({
        where: { id: parseInt(id), active: true }
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: "Juego no encontrado"
        });
      }

      // Incrementar contador de vistas
      await gameRepository.increment({ id: parseInt(id) }, "viewsCount", 1);

      res.json({
        success: true,
        data: game,
        message: "Juego obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener juego:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Obtener juegos por categoría
  async getGamesByCategory(req, res) {
    try {
      const { category } = req.params;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const games = await gameRepository.find({
        where: { category, active: true },
        order: { featured: "DESC", rating: "DESC" }
      });

      res.json({
        success: true,
        data: games,
        message: `Juegos de la categoría ${category} obtenidos exitosamente`
      });
    } catch (error) {
      console.error("Error al obtener juegos por categoría:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Obtener juegos destacados
  async getFeaturedGames(req, res) {
    try {
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const games = await gameRepository.find({
        where: { featured: true, active: true },
        order: { rating: "DESC", unitsSold: "DESC" },
        take: 6
      });

      res.json({
        success: true,
        data: games,
        message: "Juegos destacados obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener juegos destacados:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Buscar juegos
  async searchGames(req, res) {
    try {
      const { q, category, minPrice, maxPrice, sort } = req.query;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      let query = gameRepository.createQueryBuilder("game")
        .where("game.active = :active", { active: true });

      // Búsqueda por texto
      if (q) {
        query = query.andWhere(
          "(game.title LIKE :search OR game.description LIKE :search)",
          { search: `%${q}%` }
        );
      }

      // Filtro por categoría
      if (category) {
        query = query.andWhere("game.category = :category", { category });
      }

      // Filtro por precio
      if (minPrice) {
        query = query.andWhere("game.price >= :minPrice", { minPrice: parseFloat(minPrice) });
      }
      if (maxPrice) {
        query = query.andWhere("game.price <= :maxPrice", { maxPrice: parseFloat(maxPrice) });
      }

      // Ordenamiento
      switch (sort) {
        case "price-asc":
          query = query.orderBy("game.price", "ASC");
          break;
        case "price-desc":
          query = query.orderBy("game.price", "DESC");
          break;
        case "rating":
          query = query.orderBy("game.rating", "DESC");
          break;
        case "newest":
          query = query.orderBy("game.createdAt", "DESC");
          break;
        default:
          query = query.orderBy("game.featured", "DESC")
                      .addOrderBy("game.rating", "DESC");
      }

      const games = await query.getMany();

      res.json({
        success: true,
        data: games,
        message: "Búsqueda completada exitosamente"
      });
    } catch (error) {
      console.error("Error en búsqueda de juegos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Obtener categorías disponibles
  async getCategories(req, res) {
    try {
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const categories = await gameRepository
        .createQueryBuilder("game")
        .select("DISTINCT game.category", "category")
        .where("game.active = :active", { active: true })
        .getRawMany();

      const categoryList = categories.map(item => item.category);

      res.json({
        success: true,
        data: categoryList,
        message: "Categorías obtenidas exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Crear un nuevo juego (Admin)
  async createGame(req, res) {
    try {
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const newGame = gameRepository.create(req.body);
      const savedGame = await gameRepository.save(newGame);

      res.status(201).json({
        success: true,
        data: savedGame,
        message: "Juego creado exitosamente"
      });
    } catch (error) {
      console.error("Error al crear juego:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Actualizar un juego (Admin)
  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const game = await gameRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: "Juego no encontrado"
        });
      }

      await gameRepository.update(parseInt(id), req.body);
      const updatedGame = await gameRepository.findOne({ where: { id: parseInt(id) } });

      res.json({
        success: true,
        data: updatedGame,
        message: "Juego actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error al actualizar juego:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Eliminar un juego (Admin)
  async deleteGame(req, res) {
    try {
      const { id } = req.params;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const game = await gameRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: "Juego no encontrado"
        });
      }

      // Soft delete - marcar como inactivo
      await gameRepository.update(parseInt(id), { active: false });

      res.json({
        success: true,
        message: "Juego eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar juego:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // Actualizar stock de un juego (Admin)
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const gameRepository = getGameRepository();
      
      if (!gameRepository) {
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos"
        });
      }

      const game = await gameRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: "Juego no encontrado"
        });
      }

      await gameRepository.update(parseInt(id), { stock: parseInt(stock) });

      res.json({
        success: true,
        message: "Stock actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }
}

module.exports = new GameController();