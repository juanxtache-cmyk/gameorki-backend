require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { DataSource } = require("typeorm");
const Game = require("../entities/Game");

// Configuración de la base de datos
const dataSource = new DataSource({
  type: process.env.DB_TYPE || "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "game_store",
  entities: [Game],
  synchronize: false
});

async function seedGames() {
  try {
    await dataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    const gameRepository = dataSource.getRepository(Game);

    // Verificar si ya hay juegos
    const existingGames = await gameRepository.count();
    if (existingGames > 0) {
      console.log("📦 La base de datos ya contiene juegos. Saltando sembrado...");
      return;
    }

    // Datos de juegos de prueba
    const games = [
      {
        title: "Cyberpunk 2077",
        description: "Cyberpunk 2077 es un RPG de aventura y acción de mundo abierto ambientado en el futuro sombrío de Night City, una megalópolis obsesionada con el poder, el glamur y las modificaciones corporales.",
        price: 59.99,
        originalPrice: 79.99,
        imageUrl: "/asset/cyber.png",
        category: "RPG",
        genre: "Ciencia Ficción",
        platform: "PC, PS5, Xbox",
        ageRating: "M",
        releaseDate: new Date("2020-12-10"),
        developer: "CD Projekt RED",
        publisher: "CD Projekt",
        features: ["Mundo Abierto", "RPG", "Personalización"],
        systemRequirements: "Windows 10, 8GB RAM, GTX 1060",
        tags: ["Cyberpunk", "RPG", "Mundo Abierto"],
        stock: 50,
        rating: 4.2,
        reviewsCount: 1250,
        viewsCount: 0,
        featured: true,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=1",
          "https://picsum.photos/800/450?random=2",
          "https://picsum.photos/800/450?random=3"
        ]
      },
      {
        title: "Elden Ring",
        description: "Elden Ring es un juego de rol de acción en tercera persona desarrollado por FromSoftware. Explora el mundo abierto de las Tierras Intermedias.",
        price: 49.99,
        originalPrice: 59.99,
        imageUrl: "/asset/elden.png",
        category: "RPG",
        genre: "Acción/Aventura",
        platform: "PC, PS5, Xbox",
        ageRating: "M",
        releaseDate: new Date("2022-02-25"),
        developer: "FromSoftware",
        publisher: "Bandai Namco",
        features: ["Mundo Abierto", "Multijugador", "Cooperativo"],
        systemRequirements: "Windows 10, 12GB RAM, GTX 1070",
        tags: ["Souls-like", "Fantasy", "Difficult"],
        stock: 75,
        rating: 4.8,
        reviewsCount: 2100,
        viewsCount: 0,
        featured: true,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=4",
          "https://picsum.photos/800/450?random=5",
          "https://picsum.photos/800/450?random=6"
        ]
      },
      {
        title: "FIFA 23",
        description: "FIFA 23 trae el juego que todos aman aún más cerca de la realidad con la tecnología HyperMotion2, que entrega aún más realismo de juego en cada partido.",
        price: 39.99,
        originalPrice: 69.99,
        imageUrl: "/asset/fifa23.png",
        category: "Deportes",
        genre: "Simulación Deportiva",
        platform: "PC, PS5, Xbox, Switch",
        ageRating: "E",
        releaseDate: new Date("2022-09-30"),
        developer: "EA Sports",
        publisher: "Electronic Arts",
        features: ["Multijugador Online", "Ultimate Team", "Career Mode"],
        systemRequirements: "Windows 10, 8GB RAM, GTX 1050",
        tags: ["Fútbol", "Deporte", "Multijugador"],
        stock: 100,
        rating: 4.0,
        reviewsCount: 850,
        viewsCount: 0,
        featured: false,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=7",
          "https://picsum.photos/800/450?random=8",
          "https://picsum.photos/800/450?random=9"
        ]
      },
      {
        title: "Call of Duty: Modern Warfare II",
        description: "Call of Duty: Modern Warfare II es la secuela directa del aclamado Modern Warfare de 2019. Únete a las fuerzas especiales Task Force 141.",
        price: 69.99,
        originalPrice: 69.99,
        imageUrl: "/asset/call.png",
        category: "FPS",
        genre: "Acción",
        platform: "PC, PS5, Xbox",
        ageRating: "M",
        releaseDate: new Date("2022-10-28"),
        developer: "Infinity Ward",
        publisher: "Activision",
        features: ["Campaña", "Multijugador", "Modo Zombies"],
        systemRequirements: "Windows 10, 16GB RAM, GTX 1660",
        tags: ["FPS", "Militar", "Multijugador"],
        stock: 60,
        rating: 4.3,
        reviewsCount: 1800,
        viewsCount: 0,
        featured: true,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=10",
          "https://picsum.photos/800/450?random=11",
          "https://picsum.photos/800/450?random=12"
        ]
      },
      {
        title: "Horizon Forbidden West",
        description: "Únete a Aloy mientras se aventura en las tierras prohibidas, una frontera majestuosa pero peligrosa que oculta nuevas amenazas misteriosas.",
        price: 54.99,
        originalPrice: 59.99,
        imageUrl: "/asset/horizon.png",
        category: "Acción/Aventura",
        genre: "RPG de Acción",
        platform: "PS5, PC",
        ageRating: "T",
        releaseDate: new Date("2022-02-18"),
        developer: "Guerrilla Games",
        publisher: "Sony Interactive",
        features: ["Mundo Abierto", "Historia Épica", "Combate Dinámico"],
        systemRequirements: "Windows 10, 16GB RAM, GTX 1060",
        tags: ["Post-Apocalíptico", "Robots", "Aventura"],
        stock: 40,
        rating: 4.6,
        reviewsCount: 1400,
        viewsCount: 0,
        featured: false,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=13",
          "https://picsum.photos/800/450?random=14",
          "https://picsum.photos/800/450?random=15"
        ]
      },
      {
        title: "Among Us",
        description: "Juega en línea o por Wi-Fi local con 4-15 jugadores mientras intentas preparar tu nave espacial para la partida, pero cuidado ya que uno o más jugadores al azar entre la tripulación son impostores.",
        price: 4.99,
        originalPrice: 4.99,
        imageUrl: "/asset/us.jpg",
        category: "Multijugador",
        genre: "Party Game",
        platform: "PC, Mobile, Switch",
        ageRating: "E10+",
        releaseDate: new Date("2018-06-15"),
        developer: "InnerSloth",
        publisher: "InnerSloth",
        features: ["Multijugador Online", "Cross-Platform", "Voice Chat"],
        systemRequirements: "Windows 7, 1GB RAM, Integrated Graphics",
        tags: ["Party", "Deduction", "Casual"],
        stock: 999,
        rating: 4.1,
        reviewsCount: 5000,
        viewsCount: 0,
        featured: false,
        active: true,
        screenShots: [
          "https://picsum.photos/800/450?random=16",
          "https://picsum.photos/800/450?random=17",
          "https://picsum.photos/800/450?random=18"
        ]
      }
    ];

    console.log("🌱 Iniciando sembrado de juegos...");

    for (const gameData of games) {
      const game = gameRepository.create(gameData);
      await gameRepository.save(game);
      console.log(`✅ Juego creado: ${gameData.title}`);
    }

    console.log(`🎉 Sembrado completado! Se crearon ${games.length} juegos.`);

  } catch (error) {
    console.error("❌ Error durante el sembrado:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("🔌 Conexión a la base de datos cerrada");
    }
    process.exit(0);
  }
}

// Ejecutar el sembrado
console.log("🚀 Iniciando proceso de sembrado de la base de datos...");
seedGames();