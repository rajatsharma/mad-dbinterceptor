const MongoClient = require('mongodb').MongoClient
const IP = require('./identitypromise')
// const MongoKey = require('../../secrets/mongokeys')

const ConnectionPromise = () => new Promise((resolve, reject) => {
  MongoClient.connect(process.env.MONGOKEY, function (err, db) {
    if (err) reject(err)
    resolve(db)
  })
})

const withConnection = (...args) => async SomePromise => {
  const db = await ConnectionPromise()
  return SomePromise(...args, db).then(result => IP(() => {
    db.close()
    return result
  }))
}

module.exports = { ConnectionPromise, withConnection }
