import path from 'path'
import NeDB from 'nedb'

import type { Box } from '../types/types'

const boxDB = new NeDB({
  filename: path.join(__dirname, 'database/box.db'),
  autoload: true,
})

function loadBox(callback: (docs: Box[]) => void) {
  boxDB
    .find({})
    .sort({ time: 1 })
    .exec((err, docs: Box[]) => {
      return callback(docs)
    })
}

function loadData(id: string, callback: (docs: Box | null) => void) {
  boxDB.findOne({ _id: id }, (err, docs) => {
    if (err) return callback(null)
    delete docs._id
    callback(docs)
  })
}

function addBox(callback: (err: Error | null, label: string | null) => void) {
  boxDB
    .find({})
    .sort({ time: -1 })
    .limit(1)
    .exec((err, docs: Box[]) => {
      if (err) return callback(err, null)
      let newDocs = docs
      if (newDocs.length === 0) {
        newDocs = [{ status: true, number: 0, label: '', locate: false, time: false }]
      }
      var reg = newDocs[newDocs.length - 1]
      reg.status = true
      reg.time = new Date().getTime()
      reg.number = parseInt(String(reg.number)) + 1
      reg.label = calcLabel(reg.number)
      reg.locate = false
      delete reg._id
      // console.log(reg)
      boxDB.insert(reg, (err, newdoc) => {
        if (err) return callback(err, null)
        callback(null, reg.label)
      })
    })
}

function modifyBox(id: string, locate: string, callback: (err: Error | true | null) => void) {
  loadData(id, (docs) => {
    if (!docs) return callback(true)
    docs.locate = locate
    boxDB.update({ _id: id }, docs, {}, (err, n) => {
      if (err) return callback(err)
      callback(null)
    })
  })
}

function deleteBox(id: string, callback: (err: Error | true | null) => void) {
  loadData(id, (docs) => {
    if (!docs) return callback(true)
    docs.status = !docs.status
    docs.locate = false
    boxDB.update({ _id: id }, docs, {}, (err, n) => {
      if (err) return callback(err)
      callback(null)
    })
  })
}

export const box = {
  loadBox,
  addBox,
  modifyBox,
  deleteBox,
}

function calcLabel(value: number) {
  const valueMap: Record<number, string> = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
    13: 'N',
    14: 'O',
    15: 'P',
    16: 'Q',
    17: 'R',
    18: 'S',
    19: 'T',
    20: 'U',
    21: 'V',
    22: 'W',
    23: 'X',
    24: 'Y',
    25: 'Z',
  }
  //   const valueMap = {
  //     0: '0',  1: 'A',  2: 'B',  3: 'C',  4: 'D',  5: 'E',  6: 'F',  7: 'G',  8: 'H',  9: 'I',
  //    10: 'J', 11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P', 17: 'Q', 18: 'R', 19: 'S',
  //    20: 'T', 21: 'U', 22: 'V', 23: 'W', 24: 'X', 25: 'Y', 26: 'Z'
  //  }
  var reg = new RegExp('(' + Object.keys(valueMap).join('|') + ')', 'g')
  var res = ''
  let newValue = value
  if (newValue === 0) return '0'
  while (newValue > 0) {
    const s = (newValue - 1) % 26
    res = valueMap[s] + res
    newValue = parseInt(String((newValue - 1) / 26))
  }
  return res
}
