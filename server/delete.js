const path = require('path')
const NeDB = require('nedb')

const deleteDB = new NeDB({
  filename: path.join(__dirname, 'database/delete.db'),
  autoload: true
})

function addDelete (data, callback) {
  deleteDB.insert(data, (err, newdoc) => {
    if (err) return callback(err)
    callback(null)
  })
}

module.exports = {
  addDelete
}