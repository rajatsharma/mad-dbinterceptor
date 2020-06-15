const InsertInterceptor = (db, document, payload) => new Promise((resolve, reject) => {
  db.collection(document).insertMany([payload], function (err, result) {
    if (err) reject(err)
    resolve(result)
  })
})

const UpdateInterceptor = (db, document, updateQuery, query) => new Promise((resolve, reject) => {
  db.collection(document).updateMany(query, updateQuery, function (err, result) {
    if (err) reject(err)
    resolve(result)
  })
})

const FindInterceptor = (db, document, query) => new Promise((resolve, reject) => {
  db.collection(document).findOne(query, function (err, result) {
    if (err) reject(err)
    resolve(result)
  })
})

const FindManyInterceptor = (db, document, findquery) => new Promise((resolve, reject) => {
  db.collection(document).find(findquery).toArray(function (err, result) {
    if (err) reject(err)
    resolve(result)
  })
})

const EitherPromise = (Promise0, Promise1, Promise2, conditioner) => new Promise((resolve, reject) => {
  Promise0().then(result => conditioner(result) ? Promise1(result) : Promise2())
    .then(result => resolve(result))
    .catch(err => reject(err))
})

module.exports = { InsertInterceptor, UpdateInterceptor, FindInterceptor, EitherPromise, FindManyInterceptor }
