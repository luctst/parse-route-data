if (process.env.NODE_ENV === "production") {
  module.exports = require("../lib-min.js");
} else {
  module.exports = require("./index.js");
}
