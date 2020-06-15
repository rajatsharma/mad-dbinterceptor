const jwt = require('jsonwebtoken')
const { send } = require('micro')

const publicKey = process.env.PUBLICKEY

const jwtverifyPromise = token => new Promise((resolve, reject) => {
  jwt.verify(token, publicKey, { algorithms: ['HS256'] }, function (err, decoded) {
    if (err) {
      reject(err)
      return
    }
    resolve(decoded)
  })
})

const jwtcheckr = fn => async(req, res) => {
  if (!req.headers['authorization']) {
    return send(res, 403, ({ 'boo': 'No Token' }))
  }
  try {
    await jwtverifyPromise(req.headers['authorization'].split(' ')[1])
    return fn(req, res)
  } catch (e) {
    return send(res, 403, ({ 'boo': 'Authentication Failed' }))
  }
}

module.exports = { jwtcheckr }
