const { Types } = require('mongoose');

/**
 * Check if config manager has good format
 * @param {Object} configData - The object config to verify.
 * @returns {Boolean}
 */
module.exports = function checkConfigDataType(configData) {
  function getProtoName(data) {
    const l = data;
    if (l.name)
      return l.name.toLowerCase();
    return l.constructor.name.toLowerCase();
  }

  const configProto = getProtoName(configData.type);
  const allTypes = [String, Array, Types.ObjectId, Boolean, Date, Number, Object];
  const dataEnabled = {
    common: {
      default: allTypes,
      required: Boolean,
    },
    array: {
      maxLength: Number,
      itemsType: allTypes,
      itemsSchema: Object,
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
      itemsSchema: Object,
      strict: Boolean,
    },
    boolean: {},
    objectid: {},
  };
  const dataMerge = {
    ...dataEnabled.common,
    ...dataEnabled[configProto]
  };

  return Object.keys(configData).every((configManagerKey) => {
    const keyLowerCase = configManagerKey.toLowerCase();
    const constructorToLowerCase = getProtoName(configData[configManagerKey]);
    const allTypesConstructor = allTypes.map((el) => getProtoName(el));

    if (keyLowerCase === 'type') return true;
    if (Array.isArray(dataMerge[configManagerKey])) {
      return allTypesConstructor.includes(constructorToLowerCase);
    }
    return constructorToLowerCase === getProtoName(dataMerge[configManagerKey]);
  });
}