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
    if (ops.envIsDev === "development") {
      return res.status(messageForClient.code).json({
        ...messageForClient,
        stack: error.stack,
        config: ops.config,
        method: ops.method,
        query: Object.keys(req.query).length ? req.query : null,
        params: Object.keys(req.params).length ? req.params : null, 
        parsedUrl: req._parsedUrl,
        ...(ops.route && { routeSend: ops.route }),
      });
    }
    messageForClient.message = "Server error";
    return res.status(messageForClient.code).json(messageForClient);
  }

  if (ops.envIsDev === "development") {
    return res.status(messageForClient.code).json({
      ...messageForClient,
      config: ops.config,
      environment: ops.envIsDev,
      ...(ops.dataSend && { dataSend: ops.dataSend }),
      ...(ops.route && { route: ops.route }),
      ...(ops.routeConfig && { routeConfig: ops.routeConfig }),
      ...(ops.typeRoute && { typeRoute: ops.typeRoute }),
      ...(ops.key && { key: ops.key }),
      ...(ops.typeKey && { typeKey: ops.typeKey }),
      ...(ops.typesAvailables && { typesAvailables: ops.typesAvailables }),
    });
  }

  return res.status(messageForClient.code).json(messageForClient);
};
