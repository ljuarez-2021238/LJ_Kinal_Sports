export const errorHandler = (err, req, res, next) => {
  const readableMessage =
    typeof err?.message === 'string'
      ? err.message
      : typeof err === 'string'
      ? err
      : JSON.stringify(err);

  console.error(`Error in Admin Server: ${readableMessage}`);
  console.error(`Stack trace: ${err.stack}`);
  console.error(`Request: ${req.method} ${req.path}`);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors,
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} ya existe`,
      error: 'DUPLICATE_FIELD',
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Formato de ID inválido',
      error: 'INVALID_ID',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: 'TOKEN_EXPIRED',
    });
  }

  // Error personalizado con status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.code || 'CUSTOM_ERROR',
    });
  }

  // Errores de Cloudinary (firma inválida / credenciales)
  if (
    readableMessage?.includes('Invalid Signature') ||
    readableMessage?.includes('api_key') ||
    readableMessage?.includes('api_secret')
  ) {
    return res.status(502).json({
      success: false,
      message: 'Error de configuración de Cloudinary: firma inválida o credenciales incorrectas',
      error: 'CLOUDINARY_CONFIGURATION_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: readableMessage,
      }),
    });
  }

  // Error por defecto del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: readableMessage,
      stack: err.stack,
    }),
  });
};
