/**
 * Check if the object in params is valid
 * @param {Object} routeData - An object with routes and their datas.
 * @returns {Object} Config formated.
*/
module.exports = function configValid(routeData) {
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