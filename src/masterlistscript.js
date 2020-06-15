const { send } = require('micro')
const {
  // FindManyInterceptor,
  UpdateInterceptor,
  FindInterceptor
} = require('./promises/interceptorpromises')

const { withConnection } = require('./promises/dbconnectionpromise')

const MasterListRefresher = async(db) => {
  const admin = await FindInterceptor(db, 'users', { userId: '116360795980048296796' })
  const adminLists = admin.lists
  for (let i = 0; i < adminLists.length; i++) {
    const SetMasterList = await UpdateInterceptor(
      db, 'users', { $set: { 'lists.$.master': true } }, { userId: '116360795980048296796', 'lists.listId': adminLists[i].listId }
    )

    if (!SetMasterList) console.log(`Falied for ${adminLists[i].listName}`)
    else console.log(`Done for ${adminLists[i].listName}`)
  }
  return { data: admin.lists, code: 200 }
}

const refreshMasterList = async(req, res) => {
  const { code, data } = await withConnection()(MasterListRefresher)
  return send(res, code, { data })
}

module.exports = { refreshMasterList }
