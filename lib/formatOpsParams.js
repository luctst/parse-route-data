const hasOwnProperty = require('./hasOwnProperty');

/**
 * Parse options object passed in main function and return formated object.
 * @param {Object} options - An object with some options fields.
 * @returns {Object}
 */
module.exports = function formatOpsParams(options) {
  const defaultOptions = {
    errorServerCode: 500,
    errorRouteDataCode: 400,
    envIsDev: 'production'
  };

  if (options) {
    Object.keys(defaultOptions).forEach((key) => {
      if (hasOwnProperty(options, key)) {
        if (isNaN(options[key])) {
          if (key === 'envIsDev') {
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
}