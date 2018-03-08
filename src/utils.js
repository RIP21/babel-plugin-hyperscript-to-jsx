const extractClassNamesAndId = require("string-extract-class-names");

const getTagAndClassNamesAndId = string => {
  if (/^[A-Za-z0-9]+$/.test(string)) {
    return { tag: string };
  } else {
    const dotIndex = string.indexOf(".");
    const hashIndex = string.indexOf("#");
    let index = string.length;
    if (dotIndex === -1) {
      index = hashIndex;
    }
    if (hashIndex === -1) {
      index = dotIndex;
    }
    if (dotIndex !== -1 && hashIndex !== -1) {
      index = dotIndex > hashIndex ? hashIndex : dotIndex;
    }
    const tag = index !== 0 ? string.substr(0, index) : 'div';
    const classesAndIds = extractClassNamesAndId(string);

    const className = classesAndIds
      .filter(entry => {
        return entry.startsWith(".");
      })
      .map(clazz => clazz.substr(1, clazz.length))
      .join(" ");

    const firstId = classesAndIds.filter(entry => entry.startsWith("#"))[0];
    const id = firstId ? firstId.substr(1, firstId.length) : undefined;
    let result = id ? { tag, id } : { tag };
    result = className ? { ...result, className } : result;
    return result;
  }
};

module.exports = {
  getTagAndClassNamesAndId
};
