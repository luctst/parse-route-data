(function main() {
  function configValid(routeData) {
    if (!routeData) return new Error("parse route data middleware must have params");
    if (Array.isArray(routeData)) return new Error("params must be an object");
    if (typeof routeData !== "object") return new Error("params must be an object");

    const httpMethods = Object.freeze([
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "DELETE",
      "CONNECT",
      "OPTIONS",
      "TRACE",
      "PATCH",
    ]);

    const keys = Object.keys(routeData);

    if (!keys.length) {
      return new Error("Params must have keys");
    }

    const keysValid = keys.every((key) => {
      const keyUppercase = key.toUpperCase();
      return httpMethods.includes(keyUppercase);
    });

    if (!keysValid) {
      return new Error("Key in params must be HTTP verb");
    }

    const objToReturn = {};
    Object.keys(routeData).forEach((key) => {
      objToReturn[key.toUpperCase()] = routeData[key];
    });

    return objToReturn;
  }

  /**
   * Check the data from http request
   * @param {String} type - The type of data call specific function.
   * @param {Object} dataFromRequest - Data from http request
   * @param {String} keyToCheck - The key to check in the http request
   * @param {Object} dataFromRouteManager - The data from the route manager
   * @returns {(Boolean|String)}
   */
  function checkData(type, dataFromRequest, keyToCheck, dataFromRouteManager) {
    const objMethods = {
      string(dataFromHttp, key) {
        const dataHasKey = Object.prototype.hasOwnProperty.call(dataFromHttp, key);

        if (dataHasKey) {
          return true;
        }

        if (dataFromRouteManager.default) {
        }

        return true;
      },
      number() {},
      boolean() {},
    };

    return objMethods[type](dataFromRequest, keyToCheck);
  }

  function middlewareWrapper(routeData) {
    return function parseRouteData(req, res, next) {
      const dataFromMiddleware = configValid(routeData);

      if (dataFromMiddleware instanceof Error) return next(dataFromMiddleware);

      const paramsAsArray = Object.keys(req.params);
      let route = req._parsedUrl.pathname;

      if (paramsAsArray.length) {
        route = req._parsedUrl.pathname;
        paramsAsArray.forEach((key) => {
          route = route.replace(req.params[key], `:${key}`);
        });
      }

      if (!dataFromMiddleware[req.method])
        return next(new Error(`Can't find ${req.method} in your routes manager`));
      if (!Object.prototype.hasOwnProperty.call(dataFromMiddleware[req.method], route))
        return next(new Error(`${route} is not register in routes manager`));

      const dataRoute = dataFromMiddleware[req.method][route];

      if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
        if (!dataRoute)
          return next(new Error(`${req.method} must have data in your route manager`));

        if (!req.body.length) return next(new Error("Body can't be empty"));
        if (Object.keys(req.body).length > Object.keys(dataRoute).length)
          return next(new Error("Too many data send"));
      }

      if (req.method === "GET") {
        const queryAsArray = Object.keys(req.query);

        if (!dataRoute) {
          if (queryAsArray.length) return next(new Error("Can't have query params"));
        } else {
          const dataRouteAsArray = Object.keys(dataRoute);

          if (dataRoute) {
            if (queryAsArray.length !== dataRouteAsArray.length)
              return next(new Error("Query params missing or incomplete"));
          }
        }
      }

      if (dataRoute) {
        const dataFromRequest = req.method === "GET" ? req.query : req.body;
        let dataError;

        const ok = Object.keys(dataRoute).every((key) => {
          const data = dataRoute[key];

          if (!data.type) {
            dataError = `${key} must have type field in route manager`;
            return false;
          }

          if (data.required) {
            if (!Object.prototype.hasOwnProperty.call(dataFromRequest, key)) {
              dataError = `${key} in the request is missing`;
              return false;
            }
          }

          const dataResult = checkData(
            data.type.name.toLowerCase(),
            dataFromRequest,
            key,
            dataRoute
          );

          if (typeof dataResult === "string") {
            dataError = dataResult;
            return false;
          }

          return true;
        });

        if (!ok) {
          console.log(dataError);
          return next(new Error(dataError));
        }
      }

      return next();
    };
  }

  module.exports = middlewareWrapper;
})();
