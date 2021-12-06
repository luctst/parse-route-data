const { Types } = require("mongoose");
const queryString = require("query-string");

const configValid = require('./checkConfig');
const response = require('./response');
const formatOpsParams = require('./formatOpsParams');
const checkData = require('./checkData');
const hasOwnProperty = require('./hasOwnProperty');

(function main() {
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
