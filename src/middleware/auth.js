const jwt = require("jsonwebtoken")

// Middleware para verificar el token JWT
exports.verifyToken = (req, res, next) => {
  console.log('Headers recibidos:', req.headers)
  const authHeader = req.headers.authorization

  if (!authHeader) {
    console.log('No se encontró el header de autorización')
    return res.status(401).json({ 
      message: "No se proporcionó token de autenticación",
      details: "No se encontró el header Authorization"
    })
  }

  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ 
      message: "Formato de token inválido",
      details: "El header debe ser 'Bearer <token>'"
    })
  }

  const token = parts[1]
  console.log('Token extraído:', token)

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Token decodificado:', decoded)
    req.user = decoded
    next()
  } catch (error) {
    console.error('Error al verificar el token:', error)
    return res.status(401).json({ 
      message: "Token inválido o expirado",
      details: error.message
    })
  }
}

// Middleware para verificar roles
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este recurso" })
    }

    next()
  }
}
