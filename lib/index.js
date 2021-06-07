const http = require('./utils/http');

class ParseRoute {
  constructor(routeData) {
    if (!routeData) throw new Error("Add routeData params");
    if (Array.isArray(routeData)) throw new Error("routeData must be an object");
    if (typeof routeData !== "object") throw new Error("routeData must be an object");

    this.methods = Object.freeze(http);
    this.config = { ...routeData };
  }

  get httpVerbs() {
    return this.methods;
  }

  get routeConfig() {
    return this.config;
  }

  parseRoute(req, res, next) {
    const routeDataKeys = Object.keys(this.config).map((key) => key.toLocaleUpperCase());
    console.log(this.config);
  }
}

module.exports = ParseRoute;
