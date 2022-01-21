const hasOwnProperty = require("./hasOwnProperty");

/**
 * Parse options object passed in main function and return formated object.
 * @param {Object} routeData - Config object with api routes.
 * @param {String} httpMethod - request http method.
 * @param {Object} options - An object with some options fields.
 * @returns {Object}
 */
module.exports = function formatOpsParams(routeData, httpMethod, options) {
  const defaultOptions = {
    errorServerCode: 500,
    errorRouteDataCode: 400,
    envIsDev: "production",
    config: routeData,
    method: httpMethod,
  };

  if (options) {
    Object.keys(defaultOptions).forEach((key) => {
      if (hasOwnProperty(options, key)) {
        if (isNaN(options[key])) {
          if (key === "envIsDev") {
            defaultOptions.envIsDev = options[key];
            return true;
          }
        }

        if (parseInt(options[key], 10)) {
          defaultOptions[key] = options[key];
          return true;
        }

        return false;
      }

      return false;
    });
  }

  return { ...defaultOptions };
};
