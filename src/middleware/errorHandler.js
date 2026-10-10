function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server.'
  });
}

module.exports = { errorHandler };
