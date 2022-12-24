import path from 'path'
import NeDB from 'nedb'

const deleteDB = new NeDB({
  filename: path.join(__dirname, 'database/delete.db'),
  autoload: true,
})

function addDelete(data, callback) {
  deleteDB.insert(data, (err, newdoc) => {
    if (err) return callback(err)
    callback(null)
  })
}

export const del = {
  addDelete,
}
