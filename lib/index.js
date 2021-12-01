const { isValidObjectId, Types } = require("mongoose");
const queryString = require("query-string");

(function main() {
  function response(...args) {
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

  /**
   * Parse options object passed in main function and return formated object.
   * @param {Object} options - An object with some options fields.
   * @returns {Object}
   */
  function formatOpsParams(options) {
    const defaultOptions = {
      errorServerCode: 500,
      errorRouteDataCode: 400,
    };

    if (options) {
      const objToReturn = {};

      Object.key(defaultOptions).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(defaultOptions, key)) {
          parseInt(options[key], 10)
            ? (objToReturn[key] = options[key])
            : (objToReturn[key] = defaultOptions[key]);
        }
      });

      return objToReturn;
    }

    return { ...defaultOptions };
  }

  /**
   * Utils function who use hasOwnProperty.call to check if and object has either or not a field.
   * @param {Object} obj - The object to check fields.
   * @param {String} key - The field to check.
   * @returns {Boolean}
   */
  function hasOwnProperty(obj, key) {
    if (!obj || !key) return new Error("Params error");
    if (typeof obj !== "object" || typeof key !== "string")
      return new Error("Params format error");

    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /**
   * Check if the object in params is valid
   * @param {Object} routeData - An object with routes and their datas.
   * @returns {Object} Config formated.
   */
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

      if (typeof routeData[key] !== "object") return false;
      return httpMethods.includes(keyUppercase);
    });

    if (!keysValid) {
      return new Error("Key in params must be HTTP verb");
    }

    const keysGoodFormat = keys.every((key) => {
      const innerKey = Object.keys(routeData[key]);

      return innerKey.every(
        (subKey) =>
          !!(
            typeof routeData[key][subKey] === "object" || routeData[key][subKey] === null
          )
      );
    });

    if (!keysGoodFormat) {
      return new Error("route must be either an object or null");
    }

    const objToReturn = {};
    Object.keys(routeData).forEach((key) => {
      objToReturn[key.toUpperCase()] = routeData[key];
    });

    return objToReturn;
  }

  /**
   * Check if config manager has good format
   * @param {Object} configData - The object config to verify.
   * @returns {Boolean}
   */
  function checkConfigDataType(configData) {
    const allTypes = [String, Array, Types.ObjectId, Boolean, Date, Number, Object];
    const dataEnabled = {
      common: {
        default: allTypes,
        required: Boolean,
      },
      array: {
        maxLength: Number,
        itemsType: allTypes,
      },
      string: {
        match: RegExp,
        canBe: Array,
        maxLength: Number,
      },
      number: {
        max: Number,
        min: Number,
      },
      date: {
        notBefore: Date,
      },
      object: {
        params: Object,
        strict: Number,
      },
      boolean: null,
      objectid: null,
    };
    const objData = {
      ...dataEnabled.common,
      ...dataEnabled[configData.type.name.toLowerCase()],
    };

    const configDataOK = Object.keys(configData).every((key) => {
      if (key.toLowerCase() === "type") return true;

      if (key.toLowerCase() === "required") {
        if (typeof configData[key] !== objData[key].name.toLowerCase()) return false;
      }

      if (Array.isArray(objData[key])) {
        if (typeof configData[key] === "function") {
          return objData[key].find(
            (typesProto) =>
              typesProto.name.toLowerCase() === configData[key].name.toLowerCase()
          );
        }

        return objData[key].find((typesProto) => {
          const protoName = typesProto.name.toLowerCase();

          if (Array.isArray(configData[key])) {
            return protoName === "array";
          }

          return protoName === typeof configData[key];
        });
      }

      if (typeof configData[key] === "function") {
        return configData[key].name.toLowerCase() === objData[key].name.toLowerCase();
      }

      return typeof configData[key] === objData[key].name.toLowerCase();
    });

    if (!configDataOK) return false;
    return true;
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
      date(hasKey, dataFromRequest, dataFromManager) {
        if (hasKey) {
          const checkDate = new Date(dataFromRequest);

          if (checkDate instanceof Date === false) return false;

          if (dataFromManager.notBefore) {
            const dateTimeCard = checkDate.getTime();
            const datetimeNotBefore = dataFromManager.notBefore.getTime();

            if (dateTimeCard <= datetimeNotBefore) return false;
          } else if (checkDate.getTime() <= new Date().getTime()) return false;
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
      object(hasKey, dataFromRequest, dataFromManager) {
        if (hasKey) {
          if (Array.isArray(dataFromRequest)) return false;
          if (typeof dataFromRequest !== "object") return false;

          if (hasOwnProperty("params")) {
            const paramsKeys = Object.keys(dataFromManager.params);
            const bodyKeys = Object.keys(dataFromRequest);

            if (dataFromManager.strict) {
              if (paramsKeys.length !== bodyKeys.length) return false;
            }

            const paramsOk = paramsKeys.every((paramsKey) => {
              if (dataFromManager.params[paramsKey].required) {
                if (!hasOwnProperty(dataFromRequest, paramsKey)) return false;
              }

              if (
                dataFromManager.params[paramsKey].type.name.toLowerCase() !==
                typeof dataFromRequest[paramsKey]
              )
                return false;

              return true;
            });

            if (!paramsOk) return false;
          }
        }

        return true;
      },
    };

    if (checkConfigDataType(dataFromManagerConfig)) {
      if (
        isDataValidMethods[type](dataHasKey, dataFromHttp[key], dataFromManagerConfig)
      ) {
        if (
          hasOwnProperty(dataFromManagerConfig, "default") &&
          !hasOwnProperty(dataFromManagerConfig, "required") &&
          !dataHasKey
        ) {
          dataFromHttp[key] = dataFromManagerConfig.default;
        }

        return true;
      }
    }

    return `Error with the ${key} key`;
  }

  function middlewareWrapper(routeData, responseFn, ops) {
    return function parseRouteData(req, res, next) {
      const dataFromMiddleware = configValid(routeData);
      const options = formatOpsParams(ops);

      req.query = queryString.parse(req._parsedUrl.query, {
        decode: true,
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
      });

      if (dataFromMiddleware instanceof Error)
        return response(req, res, next, responseFn, dataFromMiddleware, options);

      const paramsAsArray = Object.keys(req.params);
      let route = req._parsedUrl.pathname;

      if (paramsAsArray.length) {
        route = req._parsedUrl.pathname;
        paramsAsArray.forEach((key) => {
          route = route.replace(req.params[key], `:${key}`);
        });
      }

      if (!dataFromMiddleware[req.method])
        return response(
          req,
          res,
          next,
          responseFn,
          new Error(`Can't find ${req.method} method in your routes manager`),
          options
        );

      if (!hasOwnProperty(dataFromMiddleware[req.method], route))
        return response(
          req,
          res,
          next,
          responseFn,
          new Error(`${route} is not register in routes manager`),
          options
        );

      const dataRoute = dataFromMiddleware[req.method][route];

      if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
        if (!dataRoute)
          return response(
            req,
            res,
            next,
            responseFn,
            new Error(`${req.method} must have data in your route manager`),
            options
          );

        if (!req.body.length)
          return response(
            req,
            res,
            next,
            responseFn,
            { code: options.errorRouteDataCode, message: "Body can't be empty" },
            options
          );

        if (Object.keys(req.body).length > Object.keys(dataRoute).length)
          return response(
            req,
            res,
            next,
            responseFn,
            { code: options.errorRouteDataCode, message: "Too many data send" },
            options
          );
      }

      if (req.method === "GET") {
        const queryAsArray = Object.keys(req.query);

        if (!dataRoute) {
          if (queryAsArray.length)
            return response(
              req,
              res,
              next,
              responseFn,
              new Error("Can't have query params"),
              options
            );
        }
      }

      if (dataRoute) {
        const dataFromRequest = req.method === "GET" ? req.query : req.body;
        const typesEnabled = [
          String,
          Array,
          Types.ObjectId,
          Boolean,
          Date,
          Number,
          Object,
        ];
        let dataError;

        const ok = Object.keys(dataRoute).every((key) => {
          const data = dataRoute[key];

          if (!data.type) {
            dataError = `${key} must have type field in route manager`;
            return false;
          }

          if (!typesEnabled.includes(data.type)) {
            dataError = `type field in config for ${key} key is incorrect`;
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
          return response(
            req,
            res,
            next,
            responseFn,
            { code: options.errorRouteDataCode, message: dataError },
            options
          );
        }
      }

      return next();
    };
  }

  module.exports = middlewareWrapper;
})();
