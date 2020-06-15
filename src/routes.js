const { send } = require('micro')
const {
   AddWord, DeleteUserWord, GetUserWords, AddToList, GetLists, GetListWords, DeleteList, DeleteWordsFromList, RenameList
 } = require('./promises/userpromises') //eslint-disable-line

const { GetGame, SetWordStatus, GetPreviousGames, GetUnplayedGames, DeleteGame, RefreshGame } = require('./promises/gamepromises')

const { json } = require('micro')
const { withConnection } = require('./promises/dbconnectionpromise')

const addList = async(req, res) => {
  const body = await json(req)
  const { code, message, id } = await withConnection(
    body.wordIds, body.listName, body.listId, req.params.userId
  )(AddToList)
  return send(res, code, { message, id })
}

const getLists = async(req, res) => {
  const { code, data } = await withConnection(
    req.params.userId
  )(GetLists)
  return send(res, code, { data })
}

const getListWords = async(req, res) => {
  const body = await json(req)
  const { code, data } = await withConnection(
    body.listId, req.params.userId
  )(GetListWords)
  return send(res, code, { data })
}

const deleteList = async(req, res) => {
  const body = await json(req)
  const { code, message } = await withConnection(body.listIds, req.params.userId)(DeleteList)
  return send(res, code, { message })
}

const deleteWordsFromList = async(req, res) => {
  const body = await json(req)
  const { code, message } = await withConnection(body.listId, body.senseIds, req.params.userId)(DeleteWordsFromList)
  return send(res, code, { message })
}

const renameList = async(req, res) => {
  const body = await json(req)
  const { code, message } = await withConnection(body.listId, body.newName, req.params.userId)(RenameList)
  return send(res, code, { message })
}

const userWords = async(req, res) => {
  const { code, data } = await withConnection(req.params.userId)(GetUserWords)
  return send(res, code, { data })
}

const deleteWord = async(req, res) => {
  const body = await json(req)

  const { code, message } = await withConnection(
    req.params.userId, body.senseIds
  )(DeleteUserWord)

  return send(res, code, { message })
}

const addUserWord = async(req, res) => {
  const body = await json(req)

  const { code, message } = await withConnection(req.params.userId, body)(AddWord)
  return send(res, code, { message })
}

const getGame = async(req, res) => {
  const body = await json(req)

  const { code, data } = await withConnection(body.listId, req.params.userId)(GetGame)
  return send(res, code, { data })
}

const setWordStatus = async(req, res) => {
  const body = await json(req)

  const { code, message } = await withConnection(body.status, body.mindex, body.listId, req.params.userId)(SetWordStatus)
  return send(res, code, { message })
}

const getPreviousGames = async(req, res) => {
  const { code, data } = await withConnection(req.params.userId)(GetPreviousGames)
  return send(res, code, { data })
}

const getUnplayedGames = async(req, res) => {
  const { code, data } = await withConnection(req.params.userId)(GetUnplayedGames)
  return send(res, code, { data })
}

const deleteGame = async(req, res) => {
  const body = await json(req)
  const { code, message } = await withConnection(body.listId, req.params.userId)(DeleteGame)
  return send(res, code, { message })
}

const refreshGame = async(req, res) => {
  const body = await json(req)
  const { code, message, data } = await withConnection(body.listId, req.params.userId)(RefreshGame)
  return send(res, code, { message, data })
}

const notFound = fn => async(req, res) => fn(req, res)

module.exports = {
  addUserWord, notFound, deleteWord, userWords, addList, getLists, getListWords, deleteList, deleteWordsFromList, renameList, getGame, setWordStatus, getPreviousGames, getUnplayedGames, deleteGame, refreshGame
}
