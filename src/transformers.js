const createWordsArray = (senses, word) => senses.reduce((acc, sense) => {
  let subWords = [];

  sense.subsenses && (subWords = sense.subsenses.map((subsense) => {
    return { word, meaning: subsense.definitions[0] };
  }));

  return [...acc, { word, meaning: sense.definitions[0], example: sense.examples && sense.examples[0].text }, ...subWords];
}, []);

module.exports = createWordsArray;
