import request from 'superagent'

// out: callback(response)
export function loadUser (callback) {
  request.post('/api/status')
    .type('form')
    .send({
      userid: window.localStorage.user,
      token: window.localStorage.token,
    })
    .end((err, res) => {
      if (err) return callback(null)
      if (res.body.status) {
        return callback(res.body.user)
      }
    })
}

// in: query
// out: callback(response)
export function loadList (query, callback) {
  const requestTime = String((new Date()).getTime())
  if (requestTime > window.localStorage.loadList) window.localStorage['loadList'] = requestTime
  const sendQuery = query ? query : ''
  request.post('/api/score')
    .type('form')
    .send({
      userid: window.localStorage.user,
      token: window.localStorage.token,
      query: sendQuery
    })
    .end((err, res) => {
      if (err) return callback(null)
      if (res.body.status && window.localStorage.loadList === requestTime) {
        return callback(res.body.list)
      }
    })
}

// module.exports = {
//   loadUser, loadList
// }