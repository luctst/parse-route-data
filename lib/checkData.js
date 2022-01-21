const { isValidObjectId } = require("mongoose");

const hasOwnProperty = require("./hasOwnProperty");
const checkConfigDataType = require("./checkConfigDataType");

/**
 * Check the data from http request
 * @param {String} type - The type of data call specific function.
 * @param {Object} dataFromRequest - Data from http request
 * @param {String} keyToCheck - The key to check in the http request
 * @param {Object} dataFromRouteManager - The data from the route manager
 * @returns {(Boolean|String)}
 */
module.exports = function checkData(...args) {
  const [type, dataFromHttp, key, dataFromManagerConfig] = args;
  const dataHasKey = hasOwnProperty(dataFromHttp, key);
  const isDataValidMethods = {
    string(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (typeof dataFromRequest !== "string") return false;

        if (dataFromManager.match) {
          if (dataFromManager.match instanceof RegExp) {
            if (dataFromManager.match.test(dataFromRequest) === false) return false;
          }
        }

        if (dataFromManager.canBe) {
          if (!dataFromManager.canBe.includes(dataFromRequest)) return false;
        }

        if (
          !hasOwnProperty(dataFromManager, "match") &&
          !hasOwnProperty(dataFromManager, "canBe")
        ) {
          if (hasOwnProperty(dataFromManager, "maxLength")) {
            if (dataFromRequest.length > dataFromManager.maxLength) return false;
          }
        }
      }

      return true;
    },
    boolean(hasKey, dataFromRequest) {
      if (hasKey) {
        if (typeof dataFromRequest !== "boolean") return false;
      }

      return true;
    },
    number(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        const numberInData = parseInt(dataFromRequest, 10);

        if (!numberInData) return false;

        if (dataFromManager.max) {
          if (numberInData > dataFromManager.max) return false;
        }

        if (dataFromManager.min) {
          if (numberInData < dataFromManager.min) return false;
        }
      }

      return true;
    },
    date(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        const checkDate = new Date(dataFromRequest);

        if (checkDate instanceof Date === false) return false;

        if (dataFromManager.notBefore) {
          const dateTimeCard = checkDate.getTime();
          const datetimeNotBefore = dataFromManager.notBefore.getTime();

          if (dateTimeCard <= datetimeNotBefore) return false;
        } else if (checkDate.getTime() <= new Date().getTime()) return false;
      }

      return true;
    },
    objectid(hasKey, dataFromRequest) {
      if (hasKey) {
        if (!isValidObjectId(dataFromRequest)) return false;
      }

      return true;
    },
    array(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (!Array.isArray(dataFromRequest)) return false;
        if (!dataFromRequest.length) return false;

        if (hasOwnProperty(dataFromManager, "maxLength")) {
          if (dataFromRequest.length > dataFromManager.maxLength) return false;
        }

        if (hasOwnProperty(dataFromManager, "itemsType")) {
          const self = this;
          return dataFromRequest.every((item) => {
            if (Array.isArray(dataFromManager.itemsType)) {
              if (
                !dataFromManager.itemsType.find(
                  (i) => i.name.toLowerCase() === typeof item
                )
              )
                return false;
              return self[typeof item](true, item, {});
            }

            if (typeof item !== dataFromManager.itemsType.name.toLowerCase())
              return false;
            return self[typeof item](true, item, dataFromManager);
          });
        }
      }

      return true;
    },
    object(hasKey, dataFromRequest, dataFromManager) {
      if (hasKey) {
        if (Array.isArray(dataFromRequest)) return false;
        if (typeof dataFromRequest !== "object") return false;

        if (hasOwnProperty(dataFromManager, "itemsSchema")) {
          const paramsKeys = Object.keys(dataFromManager.itemsSchema);
          const bodyKeys = Object.keys(dataFromRequest);

          if (dataFromManager.strict) {
            if (paramsKeys.length !== bodyKeys.length) return false;
          }

          return paramsKeys.every((key) =>
            this[dataFromManager.itemsSchema[key].type.name.toLowerCase()](
              true,
              dataFromRequest[key],
              dataFromManager.itemsSchema[key]
            )
          );
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

  console.error(dataFromManagerConfig);
  return `Error with the ${key} key`;
};
