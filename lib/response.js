module.exports = function response(...args) {
  const [req, res, next, responseFn, error, ops] = args;
  const messageForClient = {
    code: error instanceof Error ? ops.errorServerCode : ops.errorRouteDataCode,
    message: error.message,
  };

  if (responseFn) {
    return responseFn(req, res, next, error);
  }

  if (error instanceof Error) {
    if (ops.envIsDev === 'development') {
      return {
        ...messageForClient,
        stack: error.stack,
        config: ops.config,
        method: ops.method,
        query: req.query,
        parsedUrl: req._parsedUrl,
        ...(ops.route && { routeSend: ops.route}),
      };
    } else {
      messageForClient.message = "Server error";
    }
  }

  return res.status(messageForClient.code).json(messageForClient);
}