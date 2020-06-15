# Dbinterceptor-F

VocabDB User-word DB Free Function

## Working APIs

- `GET` `/user/:userid` Returns User Words
- `POST` `/addword/:userId` Add word to User Collection

## Secrets

- Put in `./secrets` folder

`publickey.js`

```javascript
module.exports = 'xxxxxxx' //Public key here
```

`mongokeys.js`

```javascript
module.exports = `mongodb://${username}:${password}@${dburl}:${dbport}/${collection}`
```

Protected with

<img src="https://jwt.io/assets/logo.svg" width="110">

Made With 💖
