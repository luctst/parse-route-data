const { isValidObjectId } = require("mongoose");

const hasOwnProperty = require("./hasOwnProperty");
const checkConfigDataType = require("./checkConfigDataType");
const getProtoName = require("./getProtoName");

/**
 * Check the data from http request
 * @param {String} type - The type of data call specific function.
 * @param {Object} dataFromRequest - Data from http request
 * @param {String} keyToCheck - The key to check in the http request
 * @param {Object} dataFromRouteManager - The data from the route manager
 * @returns {(Boolean|String)}
 */
module.exports = function checkData(...args) {
  let msgError = "";
  const [type, dataFromHttp, key, dataFromManagerConfig] = args;
  const dataHasKey = hasOwnProperty(dataFromHttp, key);
  const isDataValidMethods = {
    string(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (typeof dataFromRequest !== "string") {
          msgError = "should be type of string";
          return false;
        }

        if (dataFromManager.match) {
          if (dataFromManager.match instanceof RegExp) {
            if (dataFromManager.match.test(dataFromRequest) === false) {
              msgError = "doesn't match the regex";
              return false;
            }
          }
        }

        if (dataFromManager.canBe) {
          if (!dataFromManager.canBe.includes(dataFromRequest)) {
            msgError = "doesn't match value in canBe field";
            return false;
          }
        }

        if (
          !hasOwnProperty(dataFromManager, "match") &&
          !hasOwnProperty(dataFromManager, "canBe")
        ) {
          if (hasOwnProperty(dataFromManager, "maxLength")) {
            if (dataFromRequest.length > dataFromManager.maxLength) {
              msgError = "Too many characters";
              return false;
            }
          }
        }
      }

      return true;
    },
    boolean(hasKey, dataFromRequest) {
      if (hasKey) {
        if (typeof dataFromRequest !== "boolean") {
          msgError = "should be typeof boolean";
          return false;
        }
      }

      return true;
    },
    number(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        const numberInData = parseInt(dataFromRequest, 10);

        if (!numberInData) return false;

        if (dataFromManager.max) {
          if (numberInData > dataFromManager.max) {
            msgError = "higher than max field";
            return false;
          }
        }

        if (dataFromManager.min) {
          if (numberInData < dataFromManager.min) {
            msgError = "lower than min field";
            return false;
          }
        }
      }

      return true;
    },
    date(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        const checkDate = new Date(dataFromRequest);

        if (checkDate instanceof Date === false) {
          msgError = "should be typeof date";
          return false;
        }

        if (dataFromManager.notBefore) {
          const dateTimeCard = checkDate.getTime();
          const datetimeNotBefore = dataFromManager.notBefore.getTime();

          if (dateTimeCard <= datetimeNotBefore) {
            msgError = "should be after date";
            return false;
          }
        } else if (checkDate.getTime() <= new Date().getTime()) return false;
      }

      return true;
    },
    objectid(hasKey, dataFromRequest) {
      if (hasKey) {
        if (!isValidObjectId(dataFromRequest)) {
          msgError = "should be valid objectid";
          return false;
        }
      }

      return true;
    },
    array(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (!Array.isArray(dataFromRequest)) {
          msgError = "should be an array";
          return false;
        }

        if (!dataFromRequest.length) {
          msgError = "should have items in it";
          return false;
        }

        if (hasOwnProperty(dataFromManager, "maxLength")) {
          if (dataFromRequest.length > dataFromManager.maxLength) {
            msgError = "lenght too long";
            return false;
          }
        }

        if (hasOwnProperty(dataFromManager, "itemsType")) {
          const self = this;
          return dataFromRequest.every((item) => {
            if (Array.isArray(dataFromManager.itemsType)) {
              if (
                !dataFromManager.itemsType.find(
                  (i) => i.name.toLowerCase() === typeof item
                )
              ) {
                msgError = "should be same data type than itemsType field";
                return false;
              }

              return self[typeof item](true, item, {});
            }

            if (typeof item !== dataFromManager.itemsType.name.toLowerCase()) {
              msgError = "should be same data type than itemsType field";
              return false;
            }

            return self[typeof item](true, item, dataFromManager);
          });
        }
      }

      return true;
    },
    object(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (Array.isArray(dataFromRequest)) {
          msgError = "should be type of object";
          return false;
        }

        if (typeof dataFromRequest !== "object") {
          msgError = "should be type of object";
          return false;
        }

        if (hasOwnProperty(dataFromManager, "itemsSchema")) {
          const paramsKeys = Object.keys(dataFromManager.itemsSchema);
          const bodyKeys = Object.keys(dataFromRequest);

          if (dataFromManager.strict) {
            if (paramsKeys.length !== bodyKeys.length) {
              msgError = "too many keys";
              return false;
            }
          }

          return paramsKeys.every((innerKey) => {
            if (Array.isArray(dataFromManager.itemsSchema[innerKey].type)) {
              return dataFromManager.itemsSchema[innerKey].type.some((constructor) =>
                this[getProtoName(constructor)](
                  true,
                  dataFromRequest[innerKey],
                  dataFromManager.itemsSchema[innerKey]
                )
              );
            }

            return this[getProtoName(dataFromManager.itemsSchema[innerKey].type)](
              true,
              dataFromRequest[innerKey],
              dataFromManager.itemsSchema[innerKey]
            );
          });
        }
      }

      return true;
    },
  };

  if (checkConfigDataType(dataFromManagerConfig)) {
    if (isDataValidMethods[type](dataHasKey, dataFromHttp[key], dataFromManagerConfig)) {
      if (
        hasOwnProperty(dataFromManagerConfig, "default") &&
        !hasOwnProperty(dataFromManagerConfig, "required") &&
        !dataHasKey
      ) {
        dataFromHttp[key] = dataFromManagerConfig.default;
      }

      return true;
    }
  }

  return `Error with the ${key} key -> ${msgError}`;
};
