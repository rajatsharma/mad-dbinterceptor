const uuidV1 = require('uuid/v1')

const {
  FindInterceptor,
  InsertInterceptor,
  UpdateInterceptor,
  FindManyInterceptor
} = require('./interceptorpromises')

const InsertThenGetUser = (db, userId) =>
  InsertInterceptor(db, 'users', { userId: userId, words: [] })
  .then(success => FindInterceptor(db, 'users', { userId }))

const InsertThenGetWord = (db, word) =>
  InsertInterceptor(db, 'words', word)
  .then(success => FindInterceptor(db, 'words', { id: word.id }))

const FindManyAndMergeNotes = (db, word) =>
  FindManyInterceptor(db, 'words', { words: { senseId: { $in: [...word] } } })

const DeleteUserWord = async(userId, wordIds, db) => {
  const DeletedWords = await UpdateInterceptor(db, 'users', { $pull: { words: { senseId: { $in: [...wordIds] } } } }, { userId })

  if (!DeletedWords) {
    return { code: 500, message: 'Error Deleting Word(s)' }
  }

  return { code: 200, message: 'Word(s) Deleted' }
}

const GetUserWords = async(userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId }) || await InsertThenGetUser(db, userId)

  if (!user.words.length) {
    return { code: 200, data: [] }
  }

  const data = (await FindManyInterceptor(db, 'words', { id: { $in: [...user.words.map(x => x.senseId)] } }))
    .map((x, i) => ({ word: x, notes: user.words[i].notes }))
  return { code: 200, data: data.reverse() }
}

const AddToList = async(wordIds, listName, listId, userId, db) => {
  if (listId) {
    const user = await FindInterceptor(db, 'users', { userId })
    const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line
    if (requestedList[0].master === true && userId != '116360795980048296796') { //eslint-disable-line
      return { code: 500, message: 'Cannot delete Words from Master List' }
    }
  }

  const Uuid = listName ? uuidV1() : undefined
  const AddedList = listName &&
    await UpdateInterceptor(db, 'users', { $push: { lists: { listId: Uuid, words: [], listName } } }, { userId })

  if (!AddedList && !listId) {
    return { code: 500, message: (!listId && 'No List Id') || 'Fuck up while adding words to new list ' + listName }
  }

  const wordArray = wordIds.map(x => ({ senseId: x, status: 0 }))

  const AddWords =
    await UpdateInterceptor(
      db, 'users', { $push: { 'lists.$.words': { $each: [...wordArray] } } }, { userId, 'lists.listId': listId || Uuid }
    )

  if(userId == '116360795980048296796'){ //eslint-disable-line
    const SetMasterList = await UpdateInterceptor(
      db, 'users', { $set: { 'lists.$.master': true } }, { userId, 'lists.listId': listId || Uuid }
    )

    if (!SetMasterList) return { code: 500, message: 'We fucked up' }
  }

  if (!AddWords) {
    return { code: 500, message: 'We fucked up' }
  }

  return { code: 200, message: 'Words Added to List', id: Uuid }
}

const DeleteList = async(listIds, userId, db) => {
  const DeletedList =
    await UpdateInterceptor(db, 'users', { $pull: { lists: { listId: { $in: [...listIds] } } } }, { userId })

  if (!DeletedList) {
    return { code: 500, message: 'We fucked up' }
  }

  return { code: 200, message: 'List Deleted' }
}

const DeleteWordsFromList = async(listId, wordIds, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (requestedList[0].master === true && userId != '116360795980048296796') { //eslint-disable-line
    return { code: 500, message: 'Cannot delete Words from Master List' }
  }

  const DeletedWords =
    await UpdateInterceptor(
      db, 'users', { $pull: { 'lists.$.words': { senseId: { $in: [...wordIds] } } } }, { userId, 'lists.listId': listId }
    )

  if (!DeletedWords) {
    return { code: 500, message: 'We fucked up' }
  }

  return { code: 200, message: 'Words Deleted' }
}

const GetLists = async(userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })

  if (!user.lists) {
    const admin = await FindInterceptor(db, 'users', { userId: '116360795980048296796' })
    if (!admin) {
      return { code: 500, message: 'Fucked up while copying lists' }
    }
    const adminLists = admin.lists
    const AddedList =
      await UpdateInterceptor(db, 'users', { $push: { lists: { $each: [...adminLists.reverse()] } } }, { userId })
    const user = await FindInterceptor(db, 'users', { userId })

    if (!AddedList) {
      return { code: 500, message: 'Fucked up while copying lists' }
    }
    return { code: 200, data: user.lists.map(x => ({ listId: x.listId, listName: x.listName, master: x.master })).reverse() }
  }

  return { code: 200, data: user.lists.map(x => ({ listId: x.listId, listName: x.listName, master: x.master })).reverse() }
}

const GetListWords = async(listId, userId, db) => {
  const user = await FindInterceptor(db, 'users', { userId })
  const requestedList = user.lists.filter(x => x.listId == listId) //eslint-disable-line

  if (!requestedList.length) {
    return { code: 200, data: [] }
  }

  const primeRequestedList = (requestedList[0].master !== true) ? user.words.filter(x => requestedList[0].words.map(x => x.senseId).includes(x.senseId)) : requestedList[0].words

  const data = await FindManyInterceptor(db, 'words', { id: { $in: [...primeRequestedList.map(x => x.senseId)] } })

  const combinedData = data.map((x, i) => ({word: x}))
  return { code: 200, data: combinedData.reverse() }
}

const RenameList = async(listId, listNewName, userId, db) => {
  const UpdatedList = await UpdateInterceptor(
    db, 'users', { $set: { 'lists.$.listName': listNewName } }, { userId, 'lists.listId': listId }
  )

  if (!UpdatedList) {
    return { code: 200, data: [] }
  }
  return { code: 200, message: `List renamed to ${listNewName}` }
}

const AddWord = async(userId, word, db) => {
  const ExistingWord =
    await FindInterceptor(db, 'words', { id: word.id }) ||
    await InsertThenGetWord(db, word)

  if (!ExistingWord) {
    return { code: 500, message: 'word saving failed' }
  }

  const AddedWordToUser =
    await UpdateInterceptor(db, 'users', { $push:
      { words: { senseId: ExistingWord.id } }
    }, { userId })

  if (!AddedWordToUser) {
    return { code: 500, message: 'word saving failed' }
  }

  return { code: 200, message: `Added ${word.word}` }
}

module.exports = {
  AddWord,
  DeleteUserWord,
  GetUserWords,
  FindManyAndMergeNotes,
  AddToList,
  GetLists,
  GetListWords,
  DeleteList,
  DeleteWordsFromList,
  RenameList
}
