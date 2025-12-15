const { getRepository } = require("typeorm")
const Forum = require("../entities/Forum")
const Thread = require("../entities/Thread")

// Obtener todos los foros
exports.getAllForums = async (req, res) => {
  try {
    const forumRepository = getRepository(Forum)
    const forums = await forumRepository.find()

    // Para cada foro, obtener el recuento de hilos y publicaciones
    const forumsWithCounts = await Promise.all(
      forums.map(async (forum) => {
        const threadRepository = getRepository(Thread)

        // Contar hilos en este foro
        const threadCount = await threadRepository.count({
          where: { forum: { id: forum.id } },
        })

        // Contar publicaciones en todos los hilos de este foro
        const threads = await threadRepository.find({
          where: { forum: { id: forum.id } },
          relations: ["posts"],
        })

        const postCount = threads.reduce((count, thread) => {
          return count + (thread.posts ? thread.posts.length : 0)
        }, 0)

        // Obtener el último hilo con su autor
        const latestThread = await threadRepository.findOne({
          where: { forum: { id: forum.id } },
          order: { createdAt: "DESC" },
          relations: ["author"],
        })

        // Estructura de respuesta que espera el frontend
        return {
          id: forum.id,
          name: forum.name,
          description: forum.description || "",
          icon: forum.icon || forum.name.charAt(0),
          threadCount,
          postCount,
          lastPost: latestThread
            ? {
                id: latestThread.id,
                title: latestThread.title,
                date: latestThread.createdAt,
                author: {
                  id: latestThread.author.id,
                  username: latestThread.author.username,
                  avatar: latestThread.author.avatar,
                },
              }
            : null,
        }
      }),
    )

    console.log("Enviando foros al frontend:", forumsWithCounts)
    res.status(200).json(forumsWithCounts)
  } catch (error) {
    console.error("Error al obtener los foros:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener un foro por ID
exports.getForumById = async (req, res) => {
  try {
    const forumRepository = getRepository(Forum)
    const forumId = req.params.id

    const forum = await forumRepository.findOne({
      where: { id: forumId },
    })

    if (!forum) {
      return res.status(404).json({ message: "Foro no encontrado" })
    }

    // Obtener recuento de hilos y publicaciones
    const threadRepository = getRepository(Thread)

    const threadCount = await threadRepository.count({
      where: { forum: { id: forum.id } },
    })

    const threads = await threadRepository.find({
      where: { forum: { id: forum.id } },
      relations: ["posts"],
    })

    const postCount = threads.reduce((count, thread) => {
      return count + (thread.posts ? thread.posts.length : 0)
    }, 0)

    res.status(200).json({
      ...forum,
      threadCount,
      postCount,
    })
  } catch (error) {
    console.error("Error al obtener el foro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear un nuevo foro (solo admin)
exports.createForum = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para crear foros" })
    }

    const forumRepository = getRepository(Forum)
    const { name, description, icon } = req.body

    const newForum = forumRepository.create({
      name,
      description,
      icon,
    })

    await forumRepository.save(newForum)

    res.status(201).json({
      message: "Foro creado exitosamente",
      forum: newForum,
    })
  } catch (error) {
    console.error("Error al crear el foro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar un foro (solo admin)
exports.updateForum = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para actualizar foros" })
    }

    const forumRepository = getRepository(Forum)
    const forumId = req.params.id
    const { name, description, icon } = req.body

    const forum = await forumRepository.findOne({
      where: { id: forumId },
    })

    if (!forum) {
      return res.status(404).json({ message: "Foro no encontrado" })
    }

    // Actualizar los campos
    forum.name = name || forum.name
    forum.description = description || forum.description
    forum.icon = icon || forum.icon

    await forumRepository.save(forum)

    res.status(200).json({
      message: "Foro actualizado exitosamente",
      forum,
    })
  } catch (error) {
    console.error("Error al actualizar el foro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar un foro (solo admin)
exports.deleteForum = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar foros" })
    }

    const forumRepository = getRepository(Forum)
    const forumId = req.params.id

    const forum = await forumRepository.findOne({
      where: { id: forumId },
    })

    if (!forum) {
      return res.status(404).json({ message: "Foro no encontrado" })
    }

    await forumRepository.remove(forum)

    res.status(200).json({
      message: "Foro eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar el foro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
