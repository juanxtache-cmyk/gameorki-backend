const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Verificar si las credenciales de correo están configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
    process.env.EMAIL_USER === 'tu-correo@gmail.com' || 
    process.env.EMAIL_PASSWORD === 'tu-contraseña-de-app') {
  console.warn(
    '\x1b[33m%s\x1b[0m', // Texto en amarillo
    'ADVERTENCIA: Las credenciales de correo electrónico no están configuradas correctamente en el archivo .env.' +
    '\nSi deseas usar la función de recuperación de contraseña, actualiza EMAIL_USER y EMAIL_PASSWORD en el archivo .env.' +
    '\nPara Gmail, debes usar una contraseña de aplicación generada en: https://myaccount.google.com/security'
  );
}

// Configurar el transporter de nodemailer
let transporterConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'tu-correo@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-de-app'
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo
  }
};

// Opcionalmente puedes usar un servicio SMTP genérico en lugar de un servicio específico
// Por ejemplo, para usar Mailtrap en desarrollo:
/*
transporterConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "tu-usuario-mailtrap",
    pass: "tu-contraseña-mailtrap"
  }
}
*/

const transporter = nodemailer.createTransport(transporterConfig);

// Función para enviar correo con código de restablecimiento de contraseña
exports.sendPasswordResetEmail = async (email, resetCode) => {
  try {
    // Verificar transporter antes de enviar
    await transporter.verify();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-correo@gmail.com',
      to: email,
      subject: 'Código de Verificación - GameStore',
      html: `
        <h1>GameStore - Código de Verificación</h1>
        <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para continuar con el proceso:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border: 1px solid #ddd; text-align: center;">
          <h2 style="font-size: 30px; letter-spacing: 5px; font-weight: bold; color: #333;">${resetCode}</h2>
        </div>
        <p>Ingresa este código en la página de verificación para establecer una nueva contraseña.</p>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
        <p>El código expirará en 15 minutos.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    
    // En un entorno de producción, es mejor registrar el error y continuar
    // para evitar revelar información sensible al usuario
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detalles del error:', error.message);
      
      if (error.code === 'EAUTH') {
        console.error('\x1b[31m%s\x1b[0m', 'Error de autenticación: Verifica tus credenciales en el archivo .env');
        console.error('\x1b[31m%s\x1b[0m', 'Para Gmail, debes usar una contraseña de aplicación, NO tu contraseña normal');
        console.error('\x1b[31m%s\x1b[0m', 'Genera una contraseña de aplicación en: https://myaccount.google.com/security -> Contraseñas de aplicación');
      }
    }
    
    throw error;
  }
};

// Función para enviar correo de confirmación de compra con keys
exports.sendPurchaseConfirmation = async (email, userName, keys, orderNumber, orderItems, totalAmount) => {
  try {
    // Verificar transporter antes de enviar
    await transporter.verify();
    
    // Crear HTML de las keys
    const keysHtml = keys.map(key => `
      <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #007bff;">
        <h3 style="color: #333; margin: 0 0 10px 0;">🎮 ${key.gameTitle}</h3>
        <div style="background: #fff; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #007bff; text-align: center; border: 2px dashed #007bff; letter-spacing: 2px;">
          ${key.key}
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
          <strong>Plataforma:</strong> ${key.activationPlatform} | 
          <strong>Fecha:</strong> ${new Date(key.purchaseDate).toLocaleDateString('es-ES')}
        </p>
      </div>
    `).join('');

    // Crear HTML de los items de la orden
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.gameTitle}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"Game Store" <${process.env.EMAIL_USER || 'tu-correo@gmail.com'}>`,
      to: email,
      subject: `🎮 Confirmación de Compra - Orden #${orderNumber} - Game Store`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Compra - Game Store</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🎮 Game Store</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">¡Gracias por tu compra!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">¡Hola ${userName}! 👋</h2>
              
              <p style="font-size: 16px; margin-bottom: 30px; color: #555;">
                Tu compra ha sido procesada exitosamente. Aquí tienes los detalles de tu orden y las keys de activación para tus juegos.
              </p>
              
              <!-- Order Info -->
              <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #007bff;">
                <h3 style="margin: 0 0 15px 0; color: #007bff;">📋 Información de la Orden</h3>
                <p style="margin: 0 0 8px 0;"><strong>Número de orden:</strong> ${orderNumber}</p>
                <p style="margin: 0 0 8px 0;"><strong>Fecha de compra:</strong> ${new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p style="margin: 0;"><strong>Total pagado:</strong> $${totalAmount.toFixed(2)}</p>
              </div>

              <!-- Order Items -->
              <div style="margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0;">🛒 Artículos Comprados</h3>
                <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background: #f8f9fa;">
                      <th style="padding: 15px 10px; text-align: left; color: #555; font-weight: 600;">Juego</th>
                      <th style="padding: 15px 10px; text-align: center; color: #555; font-weight: 600;">Cantidad</th>
                      <th style="padding: 15px 10px; text-align: right; color: #555; font-weight: 600;">Precio Unit.</th>
                      <th style="padding: 15px 10px; text-align: right; color: #555; font-weight: 600;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr style="background: #f8f9fa; font-weight: bold;">
                      <td colspan="3" style="padding: 15px 10px; text-align: right;">TOTAL:</td>
                      <td style="padding: 15px 10px; text-align: right; color: #007bff;">$${totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Keys Section -->
              <div style="margin: 30px 0;">
                <h3 style="color: #007bff; margin: 0 0 20px 0;">🔑 Tus Keys de Activación</h3>
                <p style="color: #666; margin: 0 0 20px 0;">
                  Guarda estas keys en un lugar seguro. Cada key solo puede ser activada una vez.
                </p>
                ${keysHtml}
              </div>
              
              <!-- Instructions -->
              <div style="background: #fff8e1; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #ffc107;">
                <h4 style="margin: 0 0 15px 0; color: #f57f17; display: flex; align-items: center;">
                  📚 Instrucciones de Activación
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: #f57f17;">
                  <li style="margin-bottom: 8px;">Abre tu cliente de Steam, Epic Games Store u Origin (según corresponda)</li>
                  <li style="margin-bottom: 8px;">Busca la opción "Activar un producto" o "Canjear código"</li>
                  <li style="margin-bottom: 8px;">Acepta los términos y condiciones si es necesario</li>
                  <li style="margin-bottom: 8px;">Introduce la key exactamente como aparece arriba</li>
                  <li style="margin-bottom: 0px;">¡Disfruta tu juego!</li>
                </ol>
              </div>
              
              <!-- Important Notes -->
              <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #28a745;">
                <p style="margin: 0; color: #155724;"><strong>💡 Notas Importantes:</strong></p>
                <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #155724;">
                  <li style="margin-bottom: 8px;">Mantén este correo como respaldo de tus keys</li>
                  <li style="margin-bottom: 8px;">Las keys son válidas de forma permanente</li>
                  <li style="margin-bottom: 8px;">Si tienes problemas para activar, contacta nuestro soporte</li>
                  <li style="margin-bottom: 0px;">Puedes revisar el historial de compras en tu cuenta</li>
                </ul>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <h4 style="margin: 0 0 15px 0; color: #333;">¿Necesitas ayuda?</h4>
              <p style="margin: 0 0 10px 0; color: #666;">
                📧 <a href="mailto:soporte@gamestore.com" style="color: #007bff; text-decoration: none;">soporte@gamestore.com</a>
              </p>
              <p style="margin: 0 0 20px 0; color: #666;">
                📞 +1 (555) 123-4567 | 🕒 Lun-Vie 9:00-18:00
              </p>
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0; color: #999; font-size: 14px;">
                  <strong style="color: #333;">Game Store</strong> - Tu tienda de videojuegos de confianza<br>
                  © ${new Date().getFullYear()} Game Store. Todos los derechos reservados.
                </p>
              </div>
            </div>
            
          </div>
          
          <!-- Footer Note -->
          <div style="max-width: 600px; margin: 20px auto; text-align: center; color: #999; font-size: 12px; padding: 0 20px;">
            Este correo fue enviado automáticamente. Por favor no respondas a esta dirección.
          </div>
          
        </body>
        </html>
      `,
      text: `
¡Hola ${userName}!

Gracias por tu compra en Game Store. Aquí tienes los detalles de tu orden:

INFORMACIÓN DE LA ORDEN
- Número de orden: ${orderNumber}
- Fecha de compra: ${new Date().toLocaleDateString('es-ES')}
- Total pagado: $${totalAmount.toFixed(2)}

ARTÍCULOS COMPRADOS:
${orderItems.map(item => `- ${item.gameTitle} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

KEYS DE ACTIVACIÓN:
${keys.map(key => `${key.gameTitle}: ${key.key} (${key.activationPlatform})`).join('\n')}

INSTRUCCIONES DE ACTIVACIÓN:
1. Abre tu cliente (Steam, Epic Games, Origin)
2. Busca "Activar producto" o "Canjear código"
3. Introduce la key exactamente como aparece
4. ¡Disfruta!

NOTAS IMPORTANTES:
- Mantén este correo como respaldo
- Cada key solo puede ser activada una vez
- Las keys son válidas permanentemente
- Contacta soporte si hay problemas: soporte@gamestore.com

Game Store - Tu tienda de videojuegos de confianza
© ${new Date().getFullYear()} Game Store. Todos los derechos reservados.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo de confirmación de compra enviado: %s', info.messageId);
    console.log(`📧 Enviado a: ${email} - Orden: ${orderNumber}`);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar el correo de confirmación de compra:', error);
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detalles del error:', error.message);
      
      if (error.code === 'EAUTH') {
        console.error('\x1b[31m%s\x1b[0m', 'Error de autenticación: Verifica tus credenciales en el archivo .env');
        console.error('\x1b[31m%s\x1b[0m', 'Para Gmail, debes usar una contraseña de aplicación, NO tu contraseña normal');
        console.error('\x1b[31m%s\x1b[0m', 'Genera una contraseña de aplicación en: https://myaccount.google.com/security');
      }
    }
    
    throw error;
  }
};
