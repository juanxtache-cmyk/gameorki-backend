import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    // Crear conexión usando las variables de entorno
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_DATABASE || 'tienda_gamer'
    });

    console.log('✅ Conexión a la base de datos establecida correctamente');

    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👤 Usuarios en la base de datos: ${userCount[0].count}`);


    // Cerrar la conexión
    await connection.end();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
}

testConnection();