export function errorHandler(err, req, res, next) {
  console.error('服务器错误:', err);

  // 默认错误状态码
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `路由 ${req.method} ${req.url} 不存在`
  });
}