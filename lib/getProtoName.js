module.exports = function getProtoName(data) {
  const l = data;
  if (l.name) return l.name.toLowerCase();
  return l.constructor.name.toLowerCase();
}