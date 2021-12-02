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
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      messageForClient.stack = error.stack;
    } else {
      messageForClient.message = "Server error";
    }
  }

  return res.status(messageForClient.code).json(messageForClient);
}