// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
exports.protect = async (req, res, next) => {
  //console.log('Headers:', req.headers);
  
  let token;

  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.headers.authorization; // Si se envía el token directamente
    }
    //console.log('Token extraído:', token);
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'No estás autenticado. Por favor, inicia sesión para obtener acceso.'
    });
  }

  try {
    //console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    // Decodifica el token sin verificar para ver su contenido
    const decodedWithoutVerify = jwt.decode(token);
    //console.log('Token decodificado sin verificar:', decodedWithoutVerify);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log('Token decodificado y verificado:', decoded);

    //console.log('Buscando usuario con ID:', decoded.id);
    //console.log('Estado de la conexión:', mongoose.connection.readyState);
    
  const currentUser = await User.findById(decoded.id);
  //console.log('Usuario encontrado:', currentUser);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'El usuario perteneciente a este token ya no existe.'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Error in token verification:', error);
    if (error instanceof mongoose.Error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database error. Please try again later.'
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token'
    });
  }
};