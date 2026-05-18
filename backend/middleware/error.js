const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console for development troubleshooting
  console.error('🔥 Centralized Backend Error Handler Log:', err);

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ error: message });
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    // Extract duplicate field key
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value '${value}' entered for field '${field}'. This account or employee email already exists.`;
    return res.status(400).json({ error: message });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ error: message });
  }

  // Fallback: Generic Server Error
  res.status(err.statusCode || 500).json({
    error: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
