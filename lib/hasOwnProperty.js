/**
 * Utils function who use hasOwnProperty.call to check if and object has either or not a field.
 * @param {Object} obj - The object to check fields.
 * @param {String} key - The field to check.
 * @returns {Boolean}
 */
module.exports = function hasOwnProperty(obj, key) {
  if (!obj || !key) return new Error("Params error");
  if (typeof obj !== "object" || typeof key !== "string")
    return new Error("Params format error");

  return Object.prototype.hasOwnProperty.call(obj, key);
};
