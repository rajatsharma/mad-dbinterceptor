const compose = (...fns) => fns.reduce((f, g) => (...args) =>
  g ? f(g(...args)) : f(...args),
  fn => (req, res) => fn(req, res)
)

module.exports = { compose }
