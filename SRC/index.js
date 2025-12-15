const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { DataSource } = require("typeorm");

const routes = require("./routes");
const dbConfig = require("./config/database");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARES
// ======================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// RUTAS
// ======================
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("🚀 Backend GameOrki funcionando correctamente");
});

// ======================
// DATABASE
// ======================
const AppDataSource = new DataSource(dbConfig);
global.AppDataSource = AppDataSource;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conectado a la base de datos");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a la base de datos:", error);
  });
