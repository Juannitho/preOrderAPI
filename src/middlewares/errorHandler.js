// Single, central error handler — every error in the app ends up here (via
// next(err)) and gets the same { error } shape, whatever route threw it.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: err.message || "Internal server error",
  });
};

export default errorHandler;
