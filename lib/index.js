(function main() {
  function configValid(routeData) {
    if (!routeData) return new Error('parse route data middleware must have params');
    if (Array.isArray(routeData)) return new Error('params must be an object');
    if (typeof routeData !== 'object') return new Error('params must be an object');

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
      return new Error('Params must have keys');
    }

    const keysValid = keys.every(function (key) {
      const keyUppercase = key.toUpperCase();
      return httpMethods.includes(keyUppercase)
    });

    if (!keysValid) {
      return new Error('Key in params must be HTTP verb');
    }

    return null;
  };

  function middlewareWrapper(routeData) {
    return function parseRouteData(req, res, next) {
      const configHasError = configValid(routeData);

      if (configHasError instanceof Error) {
        return next(configHasError);
      }

      console.log('Impec');
      next();
    }
  }

  module.exports = middlewareWrapper;
})();