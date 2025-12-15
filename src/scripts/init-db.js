const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

async function initializeDatabase() {
  try {
    // Crear conexión a MySQL sin especificar la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    })

    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`)
    console.log(`Base de datos ${process.env.DB_DATABASE} creada o ya existente`)

    // Cerrar la conexión
    await connection.end()

    console.log("Inicialización de la base de datos completada")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    process.exit(1)
  }
}

initializeDatabase()
