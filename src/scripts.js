const { send } = require('micro')
const rp = require('request-promise')
const {
  FindManyInterceptor,
  UpdateInterceptor
} = require('./promises/interceptorpromises')

const { withConnection } = require('./promises/dbconnectionpromise')

const WordPronounciationUpdater = async(db, word) => {
  console.log(word.word)
  const OxfordWord = await rp('https://oxfordapif.herokuapp.com/search/' + word.word)
  const JSONOxfordWord = JSON.parse(OxfordWord)
  if (!JSONOxfordWord.pronounciation) {
    return {message: 'No pronounciation found for' + word.word}
  }
  const pronounciation = JSONOxfordWord.pronounciation
  const UpdateDb = await UpdateInterceptor(
    db, 'words', { $set: { 'pronounciation': pronounciation } }, { id: word.id }
  )
  if (!UpdateDb) {
    console.log('fucked')
    return { message: 'Went wrong for' + word.word }
  }
  return {message: 'success for ' + word.word}
}

const RefreshWords = async(db) => {
  const words = await FindManyInterceptor(db, 'words', {})
  const NonPronounciationWords = words.filter(x => !x.pronounciation)
  let doneList = []
  for (let i = 0; i < NonPronounciationWords.length; i++) {
    const result = await WordPronounciationUpdater(db, NonPronounciationWords[i])
    doneList = doneList.concat(result)
  }
  return { message: doneList, code: 200 }
}

const refreshWords = async(req, res) => {
  const { code, message } = await withConnection()(RefreshWords)
  return send(res, code, { message })
}

module.exports = { refreshWords }
