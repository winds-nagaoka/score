import path from 'path'
import NeDB from 'nedb'
import type { Score } from '../types/types'

const deleteDB = new NeDB({
  filename: path.join(__dirname, '../../database/delete.db'),
  autoload: true,
})

function addDelete(data: Score, callback: (err: Error | null) => void) {
  deleteDB.insert(data, (err, newdoc) => {
    if (err) return callback(err)
    callback(null)
  })
}

export const del = {
  addDelete,
}
