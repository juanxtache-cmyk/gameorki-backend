const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Probando configuración de email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD configurado:', !!process.env.EMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function testEmail() {
  try {
    console.log('🔍 Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa!');
    
    console.log('📧 Enviando email de prueba...');
    const result = await transporter.sendMail({
      from: `"Game Store Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Prueba de Email - Game Store',
      html: `
        <h1>✅ Email Test Exitoso</h1>
        <p>Este es un email de prueba para verificar que el sistema funciona correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Email enviado exitosamente!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error en la prueba de email:', error);
    if (error.code === 'EAUTH') {
      console.error('🔐 Error de autenticación. Verifica tus credenciales.');
      console.error('💡 Para Gmail, usa una contraseña de aplicación, no tu contraseña normal.');
    }
  }
}

testEmail();