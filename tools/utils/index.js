function stringToArray(value, def = []) {
  if (!stringIsUndefined(value)) {
    return value.split(',').map((el) => el.trim());
  }
  return def;
}

function stringIsUndefined(value) {
  return !value || (typeof value === 'string' && value === 'undefined');
}

module.exports = { stringIsUndefined, stringToArray };
