const { getRepository } = require("typeorm")
const User = require("../entities/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Obtener todos los usuarios (solo para administradores)
exports.getAllUsers = async (req, res) => {
  try {
    const userRepository = getRepository(User)
    const users = await userRepository.find({
      select: ["id", "username", "email", "avatar", "bio", "joinDate", "role"],
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return res.status(500).json({ message: "Error al obtener usuarios" })
  }
}

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const userRepository = getRepository(User)

    const user = await userRepository.findOne({
      where: { id },
      select: ["id", "username", "email", "avatar", "bio", "joinDate", "role"],
    })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return res.status(500).json({ message: "Error al obtener usuario" })
  }
}

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, bio, avatar } = req.body

    // Verificar que el usuario que hace la solicitud es el mismo que se va a actualizar
    // o es un administrador
    if (req.user.id != id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para actualizar este usuario" })
    }

    const userRepository = getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Actualizar solo los campos proporcionados
    if (username) user.username = username
    if (email) user.email = email
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar

    await userRepository.save(user)

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return res.status(500).json({ message: "Error al actualizar usuario" })
  }
}

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    // Verificar que el usuario que hace la solicitud es el mismo que se va a actualizar
    if (req.user.id != id) {
      return res.status(403).json({ message: "No tienes permiso para cambiar esta contraseña" })
    }

    const userRepository = getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await userRepository.save(user)

    return res.status(200).json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return res.status(500).json({ message: "Error al cambiar contraseña" })
  }
}

// Eliminar un usuario (solo para administradores o el propio usuario)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que el usuario que hace la solicitud es el mismo que se va a eliminar
    // o es un administrador
    if (req.user.id != id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este usuario" })
    }

    const userRepository = getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    await userRepository.remove(user)

    return res.status(200).json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return res.status(500).json({ message: "Error al eliminar usuario" })
  }
}

// Obtener estadísticas del usuario (hilos creados, posts, etc.)
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params
    const userRepository = getRepository(User)

    // Verificar que el usuario existe
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Obtener estadísticas del usuario
    const threadCount = await getRepository("Thread").count({ where: { authorId: id } })
    const postCount = await getRepository("Post").count({ where: { authorId: id } })

    return res.status(200).json({
      threadCount,
      postCount,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error)
    return res.status(500).json({ message: "Error al obtener estadísticas del usuario" })
  }
}
