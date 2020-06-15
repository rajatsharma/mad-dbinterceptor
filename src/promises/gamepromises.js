const {
  FindInterceptor,
  UpdateInterceptor,
  FindManyInterceptor
} = require('./interceptorpromises')
const Randomiser = require('../utils/randomiser')

const GetPreviousGames = async(userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })

  if (!user.lists) {
    return { code: 200, data: [] }
  }

  return {
    code: 200,
    data: user.lists.filter(x => x.played).map(x => ({
      listId: x.listId,
      listName: x.listName,
      incorrectWords: x.words.filter(x => x.status < 0).length,
      correctWords: x.words.filter(x => x.status > 0).length,
      wordsToPlay: x.words.filter(x => x.status == 0).length //eslint-disable-line
    }))
  }
}

const GetUnplayedGames = async(userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })

  if (!user.lists) {
    return { code: 200, data: [] }
  }

  return {
    code: 200,
    data: user.lists.filter(x => !x.played).map(x => ({
      listId: x.listId,
      listName: x.listName,
      incorrectWords: x.words.filter(x => x.status < 0).length,
      correctWords: x.words.filter(x => x.status > 0).length,
      wordsToPlay: x.words.filter(x => x.status == 0).length //eslint-disable-line
    })).reverse()
  }
}

const RefreshGame = async(listId, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (!requestedList[0].played) {
    return { code: 500, message: 'Cannot refersh Already Unplayed Game' }
  }

  const updatedListWords = requestedList[0].words.map(x => ({senseId: x.senseId, status: 0}))

  const UpdatedList = await UpdateInterceptor(
    db, 'users', { $set: { 'lists.$.played': true, 'lists.$.words': updatedListWords } }, { userId, 'lists.listId': listId }
  )

  if (!UpdatedList) {
    return { code: 500, message: 'We fucked up' }
  }

  const data = requestedList[0].words.length ? await FindManyInterceptor(db, 'words', { id: { $in: [...requestedList[0].words.map(x => x.senseId)] } }) : []

  return { code: 200,
    data: { wordsToPlay: data.map((x, i) =>
       Object.assign({}, x, { mindex: i, status: requestedList[0].words[i].status })
     ),
      correctWords: [],
      incorrectWords: [] }
  }
}

const DeleteGame = async(listId, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (!requestedList[0].played) {
    return { code: 200, message: 'Already Deleted' }
  }

  const resetGame = await RefreshGame(listId, userId, db)

  if (resetGame.code === 500) {
    return resetGame
  }

  const UpdatedList = await UpdateInterceptor(
    db, 'users', { $set: { 'lists.$.played': false } }, { userId, 'lists.listId': listId }
  )

  if (!UpdatedList) {
    return { code: 500, message: 'We fucked up' }
  }

  return {
    code: 200,
    message: 'Game Deleted'
  }
}

const GetGame = async(listId, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (!requestedList[0].played) {
    const data = requestedList[0].words.length ? await FindManyInterceptor(db, 'words', { id: { $in: [...requestedList[0].words.map(x => x.senseId)] } }) : []

    const UpdatedList = await UpdateInterceptor(
      db, 'users', { $set: { 'lists.$.played': true } }, { userId, 'lists.listId': listId }
    )

    if (!UpdatedList) {
      return { code: 500, message: 'We fucked up' }
    }

    return { code: 200,
      data: {
        wordsToPlay: Randomiser(data.map((x, i) => Object.assign({}, x,
      { mindex: i, status: requestedList[0].words[i].status }))),
        correctWords: [],
        incorrectWords: [] }
    }
  }

  const totalWords = await FindManyInterceptor(db, 'words', { id: { $in: [...requestedList[0].words.map(x => x.senseId)] } })
  const totalWordsWithMindex = totalWords.map((x, i) => Object.assign({}, x,
    { mindex: i, status: requestedList[0].words[i].status }))
  const wordsToPlay = totalWordsWithMindex.filter(x => x.status == 0) //eslint-disable-line
  const correctWords = totalWordsWithMindex.filter(x => x.status > 0)
  const incorrectWords = totalWordsWithMindex.filter(x => x.status < 0)
  return {
    code: 200,
    data: {
      wordsToPlay: Randomiser(wordsToPlay),
      correctWords,
      incorrectWords
    }
  }
}

const SetWordStatus = async(status, mindex, listId, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (!requestedList[0].played) {
    return { code: 500, message: 'Trying to change status of Non playing list' }
  }

  const UpdateWordStatus = await UpdateInterceptor(
    db, 'users', { $set: { [`lists.$.words.${mindex}.status`]: status } }, { userId, 'lists.listId': listId }
  )
  if (!UpdateWordStatus) {
    return { code: 500, message: 'We fucked up' }
  }
  return { code: 200, message: 'Successfully status changed' }
}

module.exports = { GetPreviousGames, GetGame, SetWordStatus, DeleteGame, GetUnplayedGames, RefreshGame }
