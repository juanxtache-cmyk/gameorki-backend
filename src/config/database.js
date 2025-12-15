const dotenv = require("dotenv")
const path = require("path")

// Configurar dotenv para buscar el archivo .env en el directorio backend
dotenv.config({ path: path.join(__dirname, "../../.env") })

module.exports = {
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "game_store_db",
  synchronize: false, // Desactivado porque ya tenemos la estructura creada
  logging: false,
  entities: [
    require("../entities/User"),
    require("../entities/Game"),
    require("../entities/Forum"),
    require("../entities/Thread"),
    require("../entities/Post"),
    require("../entities/Cart"),
    require("../entities/Order"),
    require("../entities/OrderItem"),
  ],
}
