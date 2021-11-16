const { isValidObjectId } = require("mongoose");
const queryString = require("query-string");

(function main() {
  function hasOwnProperty(obj, key) {
    if (!obj || !key) return new Error("Params error");
    if (typeof obj !== "object" || typeof key !== "string")
      return new Error("Params format error");

    return Object.prototype.hasOwnProperty.call(obj, key);
  }

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
  function checkData(...args) {
    const [type, dataFromHttp, key, dataFromManagerConfig] = args;
    const dataHasKey = hasOwnProperty(dataFromHttp, key);
    const isDataValidMethods = {
      string(hasKey, dataFromRequest, dataFromManager) {
        if (hasKey) {
          if (typeof dataFromRequest !== "string") return false;

          if (dataFromManager.match) {
            if (dataFromManager.match instanceof RegExp) {
              if (dataFromManager.match.test(dataFromRequest) === false) return false;

              if (dataFromManager.match !== dataFromRequest) return false;
            }
          }

          if (dataFromManager.canBe) {
            if (!dataFromManager.canBe.includes(dataFromRequest)) return false;
          }

          if (
            !hasOwnProperty(dataFromManager, "match") &&
            !hasOwnProperty(dataFromManager, "canBe")
          ) {
            if (hasOwnProperty(dataFromManager, "maxLength")) {
              if (dataFromRequest.length > dataFromManager.maxLength) return false;
            }
          }
        }

        return true;
      },
      boolean(hasKey, dataFromRequest) {
        if (hasKey) {
          if (typeof dataFromRequest !== "boolean") return false;
        }

        return true;
      },
      number(hasKey, dataFromRequest, dataFromManager) {
        if (hasKey) {
          const numberInData = parseInt(dataFromRequest, 10);

          if (!numberInData) return false;

          if (dataFromManager.max) {
            if (numberInData > dataFromManager.max) return false;
          }

          if (dataFromManager.min) {
            if (numberInData < dataFromManager.min) return false;
          }
        }

        return true;
      },
      date(hasKey, dataFromRequest) {
        if (hasKey) {
          const checkDate = new Date(dataFromRequest);

          if (checkDate instanceof Date === false) return false;
        }

        return true;
      },
      objectid(hasKey, dataFromRequest) {
        if (hasKey) {
          if (!isValidObjectId(dataFromRequest)) return false;
        }

        return true;
      },
      array(hasKey, dataFromRequest, dataFromManager) {
        if (hasKey) {
          if (!Array.isArray(dataFromRequest)) return false;
          if (!dataFromRequest.length) return false;

          if (hasOwnProperty(dataFromManager, "maxLength")) {
            if (dataFromRequest.length > dataFromManager.maxLength) return false;
          }

          const self = this;
          return dataFromRequest.every((item) => {
            if (Array.isArray(dataFromManager.itemsType)) {
              if (
                !dataFromManager.itemsType.find(
                  (i) => i.name.toLowerCase() === typeof item
                )
              )
                return false;
              return self[typeof item](true, item, {});
            }

            if (typeof item !== dataFromManager.itemsType.name.toLowerCase())
              return false;
            return self[typeof item](true, item, {});
          });
        }

        return true;
      },
    };

    if (isDataValidMethods[type](dataHasKey, dataFromHttp[key], dataFromManagerConfig)) {
      if (
        hasOwnProperty(dataFromManagerConfig, "default") &&
        !hasOwnProperty(dataFromManagerConfig, "required") &&
        !dataHasKey
      ) {
        dataFromHttp[key] = dataFromManagerConfig.default;
      }

      return true;
    }

    return `Error with the ${key} key`;
  }

  function middlewareWrapper(routeData) {
    return function parseRouteData(req, res, next) {
      const dataFromMiddleware = configValid(routeData);
      req.query = queryString.parse(req._parsedUrl.query, {
        decode: true,
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
      });

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
      if (!hasOwnProperty(dataFromMiddleware[req.method], route))
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
            if (!hasOwnProperty(dataFromRequest, key)) {
              dataError = `${key} in the request is missing`;
              return false;
            }
          }

          const dataResult = checkData(
            data.type.name.toLowerCase(),
            dataFromRequest,
            key,
            data
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
