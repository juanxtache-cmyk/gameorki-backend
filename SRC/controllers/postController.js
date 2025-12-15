const { getRepository } = require("typeorm")
const Post = require("../entities/Post")
const Thread = require("../entities/Thread")
const User = require("../entities/User")

// Obtener todas las publicaciones de un hilo
exports.getPostsByThread = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const threadId = req.params.threadId

    const posts = await postRepository.find({
      where: { thread: { id: threadId } },
      relations: ["author"],
      order: { createdAt: "ASC" },
    })

    // Formatear las publicaciones para la respuesta
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      threadId,
      author: {
        id: post.author.id,
        username: post.author.username,
        email: post.author.email,
        avatar: post.author.avatar,
        joinDate: post.author.joinDate,
        role: post.author.role,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isEdited: post.isEdited,
      likes: post.likes,
      isAcceptedAnswer: post.isAcceptedAnswer,
    }))

    res.status(200).json(formattedPosts)
  } catch (error) {
    console.error("Error al obtener las publicaciones:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Crear una nueva publicación
exports.createPost = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const threadRepository = getRepository(Thread)
    const userRepository = getRepository(User)

    const { content } = req.body
    const threadId = req.params.threadId
    const userId = req.user.id

    // Verificar si el hilo existe
    const thread = await threadRepository.findOne({
      where: { id: threadId },
    })

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" })
    }

    // Verificar si el hilo está bloqueado
    if (thread.isLocked) {
      return res.status(403).json({ message: "Este hilo está bloqueado y no acepta nuevas respuestas" })
    }

    // Verificar si el usuario existe
    const user = await userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Crear la nueva publicación
    const newPost = postRepository.create({
      content,
      thread,
      author: user,
    })

    await postRepository.save(newPost)

    res.status(201).json({
      message: "Publicación creada exitosamente",
      post: {
        id: newPost.id,
        content: newPost.content,
        threadId,
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        createdAt: newPost.createdAt,
        isEdited: false,
        likes: 0,
        isAcceptedAnswer: false,
      },
    })
  } catch (error) {
    console.error("Error al crear la publicación:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Actualizar una publicación
exports.updatePost = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const postId = req.params.id
    const { content } = req.body
    const userId = req.user.id

    const post = await postRepository.findOne({
      where: { id: postId },
      relations: ["author", "thread"],
    })

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" })
    }

    // Verificar si el hilo está bloqueado
    if (post.thread.isLocked) {
      return res.status(403).json({ message: "Este hilo está bloqueado y no permite editar respuestas" })
    }

    // Verificar si el usuario es el autor o un administrador
    if (post.author.id !== userId && req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para actualizar esta publicación" })
    }

    // Actualizar el contenido
    post.content = content
    post.isEdited = true

    await postRepository.save(post)

    res.status(200).json({
      message: "Publicación actualizada exitosamente",
      post: {
        id: post.id,
        content: post.content,
        threadId: post.thread.id,
        author: {
          id: post.author.id,
          username: post.author.username,
          avatar: post.author.avatar,
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        isEdited: post.isEdited,
        likes: post.likes,
        isAcceptedAnswer: post.isAcceptedAnswer,
      },
    })
  } catch (error) {
    console.error("Error al actualizar la publicación:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Eliminar una publicación
exports.deletePost = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const postId = req.params.id
    const userId = req.user.id

    const post = await postRepository.findOne({
      where: { id: postId },
      relations: ["author", "thread"],
    })

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" })
    }

    // Verificar si el hilo está bloqueado
    if (post.thread.isLocked) {
      return res.status(403).json({ message: "Este hilo está bloqueado y no permite eliminar respuestas" })
    }

    // Verificar si el usuario es el autor o un administrador
    if (post.author.id !== userId && req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta publicación" })
    }

    await postRepository.remove(post)

    res.status(200).json({
      message: "Publicación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar la publicación:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Marcar una publicación como respuesta aceptada (solo autor del hilo o admin/moderador)
exports.toggleAcceptedAnswer = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const threadRepository = getRepository(Thread)
    const postId = req.params.id
    const userId = req.user.id

    const post = await postRepository.findOne({
      where: { id: postId },
      relations: ["thread", "thread.author"],
    })

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" })
    }

    // Verificar si el usuario es el autor del hilo o un administrador/moderador
    if (post.thread.author.id !== userId && req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ message: "No tienes permiso para marcar esta publicación como respuesta aceptada" })
    }

    // Si ya hay una respuesta aceptada en este hilo, desmarcamos primero
    if (!post.isAcceptedAnswer) {
      const acceptedPost = await postRepository.findOne({
        where: {
          thread: { id: post.thread.id },
          isAcceptedAnswer: true,
        },
      })

      if (acceptedPost) {
        acceptedPost.isAcceptedAnswer = false
        await postRepository.save(acceptedPost)
      }
    }

    // Cambiar el estado de respuesta aceptada
    post.isAcceptedAnswer = !post.isAcceptedAnswer

    await postRepository.save(post)

    res.status(200).json({
      message: post.isAcceptedAnswer
        ? "Publicación marcada como respuesta aceptada"
        : "Publicación desmarcada como respuesta aceptada",
      isAcceptedAnswer: post.isAcceptedAnswer,
    })
  } catch (error) {
    console.error("Error al marcar/desmarcar la respuesta aceptada:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Dar/quitar like a una publicación
exports.toggleLike = async (req, res) => {
  try {
    const postRepository = getRepository(Post)
    const postId = req.params.id

    const post = await postRepository.findOne({
      where: { id: postId },
    })

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" })
    }

    // En una implementación real, deberíamos tener una tabla de likes
    // para rastrear qué usuarios han dado like a qué publicaciones.
    // Por simplicidad, solo incrementamos el contador.
    post.likes += 1

    await postRepository.save(post)

    res.status(200).json({
      message: "Like añadido exitosamente",
      likes: post.likes,
    })
  } catch (error) {
    console.error("Error al dar like a la publicación:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
