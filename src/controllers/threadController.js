const { getRepository } = require("typeorm")
const Thread = require("../entities/Thread")
const Forum = require("../entities/Forum")
const User = require("../entities/User")

// Obtener todos los hilos
exports.getAllThreads = async (req, res) => {
  try {
    const threadRepository = getRepository(Thread)
    const { sort = "latest", limit = 10, page = 1, forumId } = req.query

    const skip = (page - 1) * limit

    let query = threadRepository
      .createQueryBuilder("thread")
      .leftJoinAndSelect("thread.author", "author")
      .leftJoinAndSelect("thread.forum", "forum")
      .leftJoinAndSelect("thread.posts", "posts")

    // Filtrar por foro si se proporciona forumId
    if (forumId) {
      query = query.where("forum.id = :forumId", { forumId })
    }

    // Ordenar según el parámetro sort
    if (sort === "latest") {
      query = query.orderBy("thread.createdAt", "DESC")
    } else if (sort === "popular") {
      query = query.orderBy("thread.viewCount", "DESC")
    } else if (sort === "unanswered") {
      query = query
        .andWhere("(SELECT COUNT(p.id) FROM post p WHERE p.threadId = thread.id) = 0")
        .orderBy("thread.createdAt", "DESC")
    }

    // Paginación
    query = query.skip(skip).take(limit)

    const [threads, total] = await query.getManyAndCount()

    // Formatear los hilos para la respuesta
    const formattedThreads = threads.map((thread) => {
      const replyCount = thread.posts ? thread.posts.length : 0

      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        forumId: thread.forum.id,
        author: {
          id: thread.author.id,
          username: thread.author.username,
          email: thread.author.email,
          avatar: thread.author.avatar,
          joinDate: thread.author.joinDate,
          role: thread.author.role,
        },
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        viewCount: thread.viewCount,
        replyCount,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        tags: thread.tags,
      }
    })

    res.status(200).json({
      threads: formattedThreads,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener los hilos:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Obtener un hilo por ID
exports.getThreadById = async (req, res) => {
  try {
    const threadRepository = getRepository(Thread)
    const threadId = req.params.id

    const thread = await threadRepository.findOne({
      where: { id: threadId },
      relations: ["author", "forum", "posts", "posts.author"],
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Incrementar el contador de vistas
    thread.viewCount += 1
    await threadRepository.save(thread)

    // Formatear el hilo para la respuesta
    const formattedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      forumId: thread.forum.id,
      forumName: thread.forum.name,
      author: {
        id: thread.author.id,
        username: thread.author.username,
        email: thread.author.email,
        avatar: thread.author.avatar,
        joinDate: thread.author.joinDate,
        role: thread.author.role,
      },
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      viewCount: thread.viewCount,
      replyCount: thread.posts ? thread.posts.length : 0,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      tags: thread.tags,
    }

    res.status(200).json(formattedThread)
  } catch (error) {
    console.error("Error al obtener el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear un nuevo hilo
exports.createThread = async (req, res) => {
  try {
    const threadRepository = getRepository(Thread)
    const forumRepository = getRepository(Forum)
    const userRepository = getRepository(User)

    const { title, content, forumId, tags } = req.body
    const userId = req.user.id

    // Verificar si el foro existe
    const forum = await forumRepository.findOne({
      where: { id: forumId },
    })

    if (!forum) {
      return res.status(404).json({ message: "Foro no encontrado" })
    }

    // Verificar si el usuario existe
    const user = await userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Crear el nuevo hilo
    const newThread = threadRepository.create({
      title,
      content,
      forum,
      author: user,
      tags: tags || [],
    })

    await threadRepository.save(newThread)

    res.status(201).json({
      message: "Hilo creado exitosamente",
      thread: {
        id: newThread.id,
        title: newThread.title,
        content: newThread.content,
        forumId: forum.id,
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
        createdAt: newThread.createdAt,
        viewCount: 0,
        replyCount: 0,
        isPinned: newThread.isPinned,
        isLocked: newThread.isLocked,
        tags: newThread.tags,
      },
    })
  } catch (error) {
    console.error("Error al crear el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar un hilo
exports.updateThread = async (req, res) => {
  try {
    const threadRepository = getRepository(Thread)
    const threadId = req.params.id
    const { title, content, tags } = req.body
    const userId = req.user.id

    const thread = await threadRepository.findOne({
      where: { id: threadId },
      relations: ["author"],
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Verificar si el usuario es el autor o un administrador
    if (thread.author.id !== userId && req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para actualizar este hilo" })
    }

    // Actualizar los campos
    thread.title = title || thread.title
    thread.content = content || thread.content
    thread.tags = tags || thread.tags

    await threadRepository.save(thread)

    res.status(200).json({
      message: "Hilo actualizado exitosamente",
      thread,
    })
  } catch (error) {
    console.error("Error al actualizar el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar un hilo
exports.deleteThread = async (req, res) => {
  try {
    const threadRepository = getRepository(Thread)
    const threadId = req.params.id
    const userId = req.user.id

    const thread = await threadRepository.findOne({
      where: { id: threadId },
      relations: ["author"],
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Verificar si el usuario es el autor o un administrador
    if (thread.author.id !== userId && req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este hilo" })
    }

    await threadRepository.remove(thread)

    res.status(200).json({
      message: "Hilo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Fijar/desfijar un hilo (solo admin o moderador)
exports.togglePinThread = async (req, res) => {
  try {
    // Verificar si el usuario es administrador o moderador
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para fijar/desfijar hilos" })
    }

    const threadRepository = getRepository(Thread)
    const threadId = req.params.id

    const thread = await threadRepository.findOne({
      where: { id: threadId },
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Cambiar el estado de fijado
    thread.isPinned = !thread.isPinned

    await threadRepository.save(thread)

    res.status(200).json({
      message: thread.isPinned ? "Hilo fijado exitosamente" : "Hilo desfijado exitosamente",
      isPinned: thread.isPinned,
    })
  } catch (error) {
    console.error("Error al fijar/desfijar el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Bloquear/desbloquear un hilo (solo admin o moderador)
exports.toggleLockThread = async (req, res) => {
  try {
    // Verificar si el usuario es administrador o moderador
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para bloquear/desbloquear hilos" })
    }

    const threadRepository = getRepository(Thread)
    const threadId = req.params.id

    const thread = await threadRepository.findOne({
      where: { id: threadId },
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Cambiar el estado de bloqueo
    thread.isLocked = !thread.isLocked

    await threadRepository.save(thread)

    res.status(200).json({
      message: thread.isLocked ? "Hilo bloqueado exitosamente" : "Hilo desbloqueado exitosamente",
      isLocked: thread.isLocked,
    })
  } catch (error) {
    console.error("Error al bloquear/desbloquear el hilo:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
