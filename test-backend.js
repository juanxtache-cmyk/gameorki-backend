const { Game } = require('./src/entities/Game');
const { AppDataSource } = require('./src/config/database');

// Función para probar la base de datos
async function testBackend() {
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Conexión exitosa');

        console.log('🎮 Probando consulta de juegos...');
        const gameRepository = AppDataSource.getRepository(Game);
        const games = await gameRepository.find({ take: 3 });
        
        console.log(`📊 Encontrados ${games.length} juegos:`);
        games.forEach(game => {
            console.log(`- ID: ${game.id}, Título: ${game.title}, Precio: $${game.price}`);
        });

        await AppDataSource.destroy();
        console.log('✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        process.exit(1);
    }
}

testBackend();