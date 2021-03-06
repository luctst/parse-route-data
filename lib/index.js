const queryString = require("query-string");

const { default: mongoose } = require("mongoose");
const configValid = require("./checkConfig");
const response = require("./response");
const formatOpsParams = require("./formatOpsParams");
const checkData = require("./checkData");
const hasOwnProperty = require("./hasOwnProperty");
const getProtoName = require("./getProtoName");

(function main() {
  function middlewareWrapper(routeData, responseFn, ops) {
    return function parseRouteData(req, res, next) {
      const dataFromMiddleware = configValid(routeData);
      const options = formatOpsParams(dataFromMiddleware, req.method, ops);

      req.query = queryString.parse(req._parsedUrl.query, {
        decode: true,
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
      });

      if (dataFromMiddleware instanceof Error)
        return response(req, res, next, responseFn, dataFromMiddleware, options);

      const paramsAsArray = Object.keys(req.params);
      let route = Object.keys(req.query).length
        ? req.originalUrl.split("?")[0]
        : req.originalUrl;

      if (paramsAsArray.length) {
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

      if (!hasOwnProperty(dataFromMiddleware[req.method], route)) {
        return response(
          req,
          res,
          next,
          responseFn,
          new Error(`${route} is not register in routes manager`),
          {
            ...options,
            route,
          }
        );
      }

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

        if (!Object.keys(req.body).length)
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
        const dataFromRequest = ["GET", "DELETE"].includes(req.method)
          ? req.query
          : req.body;
        const typesEnabled = [
          getProtoName(String),
          getProtoName(Array),
          getProtoName(mongoose.Types.ObjectId),
          getProtoName(Boolean),
          getProtoName(Date),
          getProtoName(Number),
          getProtoName(Object),
        ];
        let dataError;
        let keyError;

        const ok = Object.keys(dataRoute).every((key) => {
          keyError = key;
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

          if (Array.isArray(data.type)) {
            if (!data.type.every((tp) => typesEnabled.includes(getProtoName(tp)))) {
              dataError = `Inner type in config for ${key} field is incorrect`;
              return false;
            }

            const constructorKeyAccept = data.type.map((constructorType) =>
              getProtoName(constructorType)
            );
            let constructorKeyFromBody = getProtoName(dataFromRequest[key]);

            if (constructorKeyFromBody === "string") {
              if (mongoose.isObjectIdOrHexString(dataFromRequest[key])) {
                constructorKeyFromBody = "objectid";
              }
            }

            if (!constructorKeyAccept.includes(constructorKeyFromBody)) {
              dataError = `${key} type is incorrect, received ${getProtoName(
                dataFromRequest[key]
              )} expected ${constructorKeyAccept.join(" or ")}`;
              return false;
            }

            return checkData(
              constructorKeyFromBody.toLowerCase(),
              dataFromRequest,
              key,
              data
            );
          }

          if (!typesEnabled.includes(getProtoName(data.type))) {
            dataError = `type field in config for ${key} key is incorrect`;
            return false;
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
            {
              ...options,
              dataSend: dataFromRequest,
              route,
              routeConfig: dataRoute[keyError],
              key: keyError,
              typeKey: dataFromRequest[keyError]
                ? getProtoName(dataFromRequest[keyError])
                : dataFromRequest[keyError],
              typeRoute: dataRoute[keyError].type
                ? getProtoName(dataRoute[keyError].type)
                : undefined,
              typesAvailables: typesEnabled,
            }
          );
        }
      }

      return next();
    };
  }

  module.exports = middlewareWrapper;
})();
