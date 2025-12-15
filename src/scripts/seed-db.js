const { createConnection, getRepository } = require("typeorm")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const dbConfig = require("../config/database")
const User = require("../entities/User")
const Forum = require("../entities/Forum")
const Thread = require("../entities/Thread")
const Post = require("../entities/Post")

dotenv.config()

async function seedDatabase() {
  try {
    // Conectar a la base de datos
    const connection = await createConnection(dbConfig)
    console.log("Conexión a la base de datos establecida")

    // Repositorios
    const userRepository = getRepository(User)
    const forumRepository = getRepository(Forum)
    const threadRepository = getRepository(Thread)
    const postRepository = getRepository(Post)

    // Crear usuarios
    const adminPassword = await bcrypt.hash("admin123", 10)
    const userPassword = await bcrypt.hash("user123", 10)

    const admin = userRepository.create({
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      bio: "Administrador del foro",
      joinDate: new Date(),
    })

    const user1 = userRepository.create({
      username: "user1",
      email: "user1@example.com",
      password: userPassword,
      role: "user",
      bio: "Usuario regular del foro",
      joinDate: new Date(),
    })

    const user2 = userRepository.create({
      username: "user2",
      email: "user2@example.com",
      password: userPassword,
      role: "user",
      bio: "Otro usuario del foro",
      joinDate: new Date(),
    })

    const moderator = userRepository.create({
      username: "moderator",
      email: "moderator@example.com",
      password: await bcrypt.hash("moderator123", 10),
      role: "moderator",
      bio: "Moderador del foro",
      joinDate: new Date(),
    })

    await userRepository.save([admin, user1, user2, moderator])
    console.log("Usuarios creados")

    // Crear foros
    const forum1 = forumRepository.create({
      name: "Action Games",
      description: "Discuss the latest action games, share tips and strategies.",
      icon: "A",
    })

    const forum2 = forumRepository.create({
      name: "RPG Discussion",
      description: "For fans of role-playing games, both western and JRPGs.",
      icon: "R",
    })

    const forum3 = forumRepository.create({
      name: "Strategy Games",
      description: "RTS, turn-based, and all other strategy game discussions.",
      icon: "S",
    })

    const forum4 = forumRepository.create({
      name: "Indie Games",
      description: "Discover and discuss indie game gems and upcoming releases.",
      icon: "I",
    })

    const forum5 = forumRepository.create({
      name: "Gaming News",
      description: "The latest news, announcements, and industry updates.",
      icon: "N",
    })

    await forumRepository.save([forum1, forum2, forum3, forum4, forum5])
    console.log("Foros creados")

    // Crear hilos
    const thread1 = threadRepository.create({
      title: "Best RPG games of 2024",
      content:
        "<p>What are your favorite RPG games released this year? I've been playing Elden Ring and it's amazing!</p>",
      author: user1,
      forum: forum2,
      tags: ["rpg", "elden ring", "2024"],
      viewCount: 120,
      isPinned: true,
    })

    const thread2 = threadRepository.create({
      title: "Strategy game recommendations",
      content: "<p>I'm looking for new strategy games to play. Any recommendations?</p>",
      author: user2,
      forum: forum3,
      tags: ["strategy", "recommendations"],
      viewCount: 85,
    })

    const thread3 = threadRepository.create({
      title: "Upcoming Nintendo Switch Games",
      content: "<p>What Nintendo Switch games are you looking forward to in the coming months?</p>",
      author: moderator,
      forum: forum5,
      tags: ["nintendo", "switch", "upcoming"],
      viewCount: 210,
    })

    await threadRepository.save([thread1, thread2, thread3])
    console.log("Hilos creados")

    // Crear publicaciones
    const post1 = postRepository.create({
      content: "<p>I've been playing Baldur's Gate 3 and it's definitely my GOTY!</p>",
      author: user2,
      thread: thread1,
      likes: 15,
    })

    const post2 = postRepository.create({
      content: "<p>I recommend Civilization VI if you like turn-based strategy games.</p>",
      author: user1,
      thread: thread2,
      likes: 8,
      isAcceptedAnswer: true,
    })

    const post3 = postRepository.create({
      content: "<p>Age of Empires 4 is also a great choice for RTS fans.</p>",
      author: moderator,
      thread: thread2,
      likes: 12,
    })

    const post4 = postRepository.create({
      content: "<p>I'm really excited for the new Zelda game!</p>",
      author: user1,
      thread: thread3,
      likes: 20,
    })

    await postRepository.save([post1, post2, post3, post4])
    console.log("Publicaciones creadas")

    console.log("Base de datos poblada exitosamente")
    await connection.close()
  } catch (error) {
    console.error("Error al poblar la base de datos:", error)
    process.exit(1)
  }
}

seedDatabase()
