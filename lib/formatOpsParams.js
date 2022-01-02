/**
 * Parse options object passed in main function and return formated object.
 * @param {Object} options - An object with some options fields.
 * @returns {Object}
 */
module.exports = function formatOpsParams(options) {
  const defaultOptions = {
    errorServerCode: 500,
    errorRouteDataCode: 400,
    env: options.envIsDev ? 'development' : 'production'
  };

  if (options) {
    const objToReturn = {};

    Object.keys(defaultOptions).forEach((key) => {
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