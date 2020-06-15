require('dotenv').config()

const { router, get, post, del } = require('microrouter')

const { compose } = require('./composer')
const { jwtcheckr } = require('./jwtcheckr') //eslint-disable-line
const { notFound, addUserWord, userWords, deleteWord, addList, getLists, getListWords,
  deleteList, deleteWordsFromList, renameList, getGame, setWordStatus, getPreviousGames, getUnplayedGames, deleteGame, refreshGame } = require('./routes')
const ping = require('./ping')
const microCors = require('micro-cors')
const cors = microCors({ allowMethods: ['GET', 'POST'] }, { allowHeaders: [
  'X-Requested-With', 'Access-Control-Allow-Origin', 'X-HTTP-Method-Override', 'Content-Type', 'Authorization', 'Accept',
  'X-User'
]})
const { send } = require('micro')

const { refreshWords } = require('./scripts')
const { refreshMasterList } = require('./masterlistscript')

module.exports = compose(
  cors,
  ping,
  jwtcheckr, // All authenticated routes start from here
  fn => router(
    get('/user/:userId', userWords),
    post('/addword/:userId', addUserWord),
    post('/deleteword/:userId', deleteWord),
    post('/addlist/:userId', addList),
    get('/lists/:userId', getLists),
    post('/getlistwords/:userId', getListWords),
    post('/deletelist/:userId', deleteList),
    post('/deletelistwords/:userId', deleteWordsFromList),
    post('/renamelist/:userId', renameList),
    post('/getgame/:userId', getGame),
    post('/setwordstatus/:userId', setWordStatus),
    get('/previousgames/:userId', getPreviousGames),
    get('/unplayedgames/:userId', getUnplayedGames),
    post('/deletegame/:userId', deleteGame),
    post('/refreshgame/:userId', refreshGame),
    get('/startWordRefreshScript', refreshWords),
    get('/startMasterlistRefreshScript', refreshMasterList),
    get('/*', notFound(fn)),
    post('/*', notFound(fn)),
    del('/*', notFound(fn))
  )
)((req, res) => send(res, 404, {'404': 'Not Found'}))
