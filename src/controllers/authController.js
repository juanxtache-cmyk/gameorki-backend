const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../entities/User")

// Función auxiliar para obtener el repositorio
const getUserRepository = () => {
  return global.AppDataSource ? global.AppDataSource.getRepository(User) : null;
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    const { username, email, password, firstName, lastName } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({
      where: [{ username }, { email }],
    })

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "El usuario o email ya está en uso" 
      })
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario
    const newUser = userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "user",
    })

    await userRepository.save(newUser)

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role }, 
      process.env.JWT_SECRET || "fallback-secret", 
      { expiresIn: "7d" }
    )

    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Error en el registro:", error)
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message
    })
  }
}

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const { email, username, password } = req.body

    // Buscar el usuario por email o username
    const user = await userRepository.findOne({ 
      where: [
        { email: email || "" }, 
        { username: username || email || "" }
      ]
    })

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Credenciales inválidas" 
      })
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Credenciales inválidas" 
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || "fallback-secret", 
      { expiresIn: "7d" }
    )

    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Error en el inicio de sesión:", error)
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message
    })
  }
}

// Solicitar restablecimiento de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo electrónico es requerido" });
    }

    // Buscar al usuario por email
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Por seguridad, no informamos si el email existe o no
      return res.status(200).json({ 
        message: "Si el correo está registrado, recibirás un código de verificación para restablecer tu contraseña" 
      });
    }

    // Generar código de verificación (6 dígitos)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // También generamos un token para seguridad adicional que se usará junto con el código
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Guardar código y token en la base de datos
    user.resetPasswordToken = hashedToken;
    user.resetPasswordCode = resetCode;
    // El código expira en 15 minutos
    user.resetPasswordCodeExpires = new Date(Date.now() + 15 * 60000); // 15 minutos
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora total para todo el proceso
    
    await userRepository.save(user);
    
    // Importar servicio de email
    const emailService = require('../utils/emailService');
    
    try {
      // Enviar correo con código
      await emailService.sendPasswordResetEmail(
        user.email,
        resetCode
      );

      res.status(200).json({ 
        message: "Si el correo está registrado, recibirás un código de verificación para restablecer tu contraseña",
        // En desarrollo, podemos enviar el token para facilitar el proceso
        // En producción esto debe ser eliminado
        token: process.env.NODE_ENV !== 'production' ? resetToken : undefined
      });
    } catch (emailError) {
      console.error("Error al enviar correo de recuperación:", emailError);
      
      // Si hay un error al enviar el correo, no revelamos esto al usuario por seguridad
      // pero enviamos una respuesta exitosa de todas formas
      res.status(200).json({ 
        message: "Si el correo está registrado, recibirás un código de verificación para restablecer tu contraseña" 
      });
    }
  } catch (error) {
    console.error("Error en la recuperación de contraseña:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Validar código de verificación
exports.verifyCode = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: "Correo y código son requeridos" });
    }
    
    // Buscar al usuario con ese email
    const user = await userRepository.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }
    
    // Verificar el código
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: "Código inválido" });
    }
    
    // Verificar que el código no ha expirado
    const currentDate = new Date();
    if (user.resetPasswordCodeExpires && user.resetPasswordCodeExpires < currentDate) {
      return res.status(400).json({ message: "El código ha expirado, solicita uno nuevo" });
    }
    
    // Si el código es válido, generamos un token temporal para el cambio de contraseña
    const tempToken = crypto.randomBytes(32).toString('hex');
    
    // Actualizamos el token en la base de datos
    user.resetPasswordToken = crypto.createHash('sha256').update(tempToken).digest('hex');
    
    await userRepository.save(user);
    
    res.status(200).json({ 
      message: "Código verificado correctamente", 
      token: tempToken
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Restablecer contraseña después de verificar código
exports.resetPassword = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
    }
    
    // Hash del token recibido para comparar con el almacenado
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Buscar al usuario con ese token
    const user = await userRepository.findOne({ 
      where: { 
        resetPasswordToken: hashedToken
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }
    
    // Verificar que el token no ha expirado
    const currentDate = new Date();
    if (user.resetPasswordExpires && user.resetPasswordExpires < currentDate) {
      return res.status(400).json({ message: "El token ha expirado, solicita uno nuevo" });
    }
    
    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar todos los tokens y códigos
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.resetPasswordCodeExpires = null;
    
    await userRepository.save(user);
    
    res.status(200).json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener perfil del usuario
exports.getProfile = async (req, res) => {
  try {
    const userRepository = getUserRepository();
    
    if (!userRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const userId = req.user.id

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "username", "email", "avatar", "bio", "joinDate", "role"],
    })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error al obtener el perfil:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}
