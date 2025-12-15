const Cart = require("../entities/Cart")

// Función auxiliar para obtener el repositorio
const getCartRepository = () => {
  return global.AppDataSource ? global.AppDataSource.getRepository(Cart) : null;
};

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
  try {
    console.log('Petición recibida para obtener carrito. Usuario:', req.user)
    
    if (!req.user || !req.user.id) {
      console.log('Usuario no autenticado o ID no encontrado')
      return res.status(401).json({ 
        success: false,
        message: "Usuario no autenticado",
        details: "Se requiere autenticación para acceder al carrito" 
      })
    }

    const cartRepository = getCartRepository();
    
    if (!cartRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    const userId = req.user.id
    console.log('Buscando carrito para el usuario:', userId)

    let cart = await cartRepository.findOne({ where: { userId } })
    console.log('Carrito encontrado en BD:', cart)

    if (!cart) {
      console.log('Creando nuevo carrito para el usuario:', userId)
      // Si el usuario no tiene carrito, crear uno nuevo
      cart = cartRepository.create({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      })
      await cartRepository.save(cart)
      console.log('Nuevo carrito creado:', cart)
    }

    console.log('Enviando carrito al cliente:', cart)
    res.status(200).json({
      success: true,
      data: cart,
      message: "Carrito obtenido exitosamente"
    })
  } catch (error) {
    console.error("Error al obtener el carrito:", error)
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message
    })
  }
}

// Actualizar el carrito
exports.updateCart = async (req, res) => {
  try {
    console.log('🛒 BACKEND: Petición PUT recibida para actualizar carrito');
    console.log('👤 Usuario:', req.user);
    console.log('📦 Datos recibidos:', req.body);
    
    const cartRepository = getCartRepository();
    
    if (!cartRepository) {
      console.log('❌ BACKEND: Error - repositorio no disponible');
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const userId = req.user.id
    const { items, totalItems, totalPrice } = req.body

    console.log('🔍 BACKEND: Buscando carrito existente para usuario:', userId);
    let cart = await cartRepository.findOne({ where: { userId } })
    console.log('📦 BACKEND: Carrito existente:', cart);

    if (!cart) {
      console.log('➕ BACKEND: Creando nuevo carrito');
      cart = cartRepository.create({
        userId,
        items,
        totalItems,
        totalPrice,
      })
    } else {
      console.log('🔄 BACKEND: Actualizando carrito existente');
      cart.items = items
      cart.totalItems = totalItems
      cart.totalPrice = totalPrice
    }

    console.log('💾 BACKEND: Guardando carrito:', cart);
    await cartRepository.save(cart)
    
    console.log('✅ BACKEND: Carrito guardado exitosamente, enviando respuesta');
    res.status(200).json({
      success: true,
      data: cart,
      message: "Carrito actualizado exitosamente"
    })
  } catch (error) {
    console.error("❌ BACKEND: Error al actualizar el carrito:", error)
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message
    })
  }
}

// Limpiar el carrito
exports.clearCart = async (req, res) => {
  try {
    const cartRepository = getCartRepository();
    
    if (!cartRepository) {
      return res.status(500).json({
        success: false,
        message: "Error de conexión a la base de datos"
      });
    }
    
    const userId = req.user.id

    let cart = await cartRepository.findOne({ where: { userId } })

    if (cart) {
      cart.items = []
      cart.totalItems = 0
      cart.totalPrice = 0
      await cartRepository.save(cart)
    }

    res.status(200).json({ 
      success: true,
      message: "Carrito limpiado exitosamente" 
    })
  } catch (error) {
    console.error("Error al limpiar el carrito:", error)
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message
    })
  }
}
