const { Types } = require('mongoose');

/**
 * Check if config manager has good format
 * @param {Object} configData - The object config to verify.
 * @returns {Boolean}
 */
module.exports = function checkConfigDataType(configData) {
  const allTypes = [String, Array, Types.ObjectId, Boolean, Date, Number, Object];
  const dataEnabled = {
    common: {
      default: allTypes,
      required: Boolean,
    },
    array: {
      maxLength: Number,
      itemsType: allTypes,
    },
    string: {
      match: RegExp,
      canBe: Array,
      maxLength: Number,
    },
    number: {
      max: Number,
      min: Number,
    },
    date: {
      notBefore: Date,
    },
    object: {
      params: Object,
      strict: Boolean,
    },
    boolean: null,
    objectid: null,
  };
  const objData = {
    ...dataEnabled.common,
    ...dataEnabled[configData.type.name.toLowerCase()],
  };

  const configDataOK = Object.keys(configData).every((key) => {
    if (key.toLowerCase() === "type") return true;

    if (key.toLowerCase() === "required") {
      if (typeof configData[key] !== objData[key].name.toLowerCase()) return false;
    }

    if (Array.isArray(configData[key])) {
      return objData[key].name.toLowerCase() === 'array';
    }

    if (Array.isArray(objData[key])) {
      if (typeof configData[key] === "function") {
        return objData[key].find(
          (typesProto) =>
            typesProto.name.toLowerCase() === configData[key].name.toLowerCase()
        );
      }

      return objData[key].find((typesProto) => {
        const protoName = typesProto.name.toLowerCase();

        if (Array.isArray(configData[key])) {
          return protoName === "array";
        }

        return protoName === typeof configData[key];
      });
    }

    if (typeof configData[key] === "function") {
      return configData[key].name.toLowerCase() === objData[key].name.toLowerCase();
    }

    return configData[key].constructor.name.toLowerCase() === objData[key].name.toLowerCase();
  });

  if (!configDataOK) return false;
  return true;
}