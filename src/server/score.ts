import path from 'path'
import NeDB from 'nedb'

import { lib } from './lib'
// const auth = require('./auth')
// const del = require('./delete')

import { del } from './delete'

type Score = {}

const scoreDB = new NeDB({
  filename: path.join(__dirname, 'database/score.db'),
  autoload: true,
  timestampData: true,
})

function loadScore(query: string, callback: (docs: Score[] | null) => void) {
  if (query === '') {
    scoreDB
      .find({ status: 'true' })
      .sort({ titleJa: 1 })
      .exec((err, docs) => {
        return callback(docs)
      })
  } else if (query.match(/^box[-:]\s?/i)) {
    // console.log('箱の検索',query.replace(/^box[-:]\s?/ig, ''))
    if (!query.replace(/^box[-:]\s?/gi, '')) return callback(null)
    scoreDB
      .find({ status: 'true', boxLabel: new RegExp(lib.escapeReg(query.replace(/^box[-:]\s?/gi, '')), 'i') })
      .sort({ label: 1 })
      .exec((err, docs) => {
        if (err) return callback(null)
        return callback(docs)
      })
  } else if (query.match(/^(保管|貸出|使用)中?/g)) {
    let request
    if (query.match(/貸出中?/g)) {
      request = 2
    } else if (query.match(/使用中?/g)) {
      request = 1
    } else {
      request = 0
    }
    console.log('状態の検索', query, request)
    scoreDB
      .find({ status: 'true', scoreStatus: String(request) })
      .sort({ label: 1 })
      .exec((err, docs) => {
        if (err) return callback(null)
        return callback(docs)
      })
  } else {
    const s = new RegExp(lib.escapeReg(query), 'i')
    // console.log('正規表現', s)
    const searchQuery = [
      { titleEn: s },
      { titleJa: s },
      { subtitle: s },
      { composer: s },
      { arranger: s },
      { label: s },
    ]
    // listDB.find({ $or: [{titleEn: s}, {titleJa: s}, {subtitle: s}, {composer: s}, {arranger: s}]}, (err, docs) => {
    scoreDB
      .find({ status: 'true', $or: searchQuery })
      .sort({ titleEn: 1 })
      .exec((err, docs) => {
        if (err) return callback(null)
        return callback(docs)
      })
  }
}

function loadScoreAll(callback: (docs: Score[]) => void) {
  scoreDB
    .find({ status: 'true' })
    .sort({ createdAt: 1 })
    .exec((err, docs) => {
      return callback(docs)
    })
}

function loadData(id: string, callback: (docs: Score[] | null) => void) {
  scoreDB.findOne({ _id: id }, (err, docs) => {
    if (err) return callback(null)
    delete docs._id
    callback(docs)
  })
}

// 新規登録時に最新の情報を取得
function loadLatest(callback: (docs: Score[] | null) => void) {
  // scoreDB.find({}).sort({time: -1}).limit(1).exec((err, docs) => {
  scoreDB
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .exec((err, docs) => {
      if (err) return callback(null)
      // console.log('latest')
      // console.log(docs)
      return callback(docs)
    })
}

// 新規登録時の重複チェック
function checkData(num: number, callback: (err: Error | null, docs: Score[] | null) => void) {
  scoreDB.findOne({ number: num }, (err, docs) => {
    if (err) return callback(err, null)
    if (!docs) return callback(null, null)
    callback(null, docs)
  })
}

function addScore(data: Score, callback: (err: Error | null) => void) {
  // data.time = String((new Date()).getTime())
  data.status = 'true'
  scoreDB.insert(data, (err, newdoc) => {
    if (err) return callback(err)
    callback(null)
  })
}

function modifyScore(id: string, data: Score, callback: (err: Error | null) => void) {
  scoreDB.update({ _id: id }, data, {}, (err, n) => {
    if (err) return callback(err)
    callback(null)
  })
}

function searchInput(target: string, query: string, callback: (docs: Score[] | null) => void) {
  if (query === '') return callback(null)
  // console.log(target, query)
  const s = new RegExp(lib.escapeReg(query), 'i')
  var searchQuery = new Object()
  searchQuery[target] = s
  // console.log(searchQuery)
  scoreDB.find(searchQuery, (err: Error, docs: Score[]) => {
    if (err) return callback(null)
    // console.log(docs)
    return callback(docs)
  })
}

function deleteScore(id: string, callback: (result: true | null) => void) {
  loadData(id, (data) => {
    if (!data) return callback(null)
    data.status = false
    scoreDB.update({ _id: id }, data, {}, (err, n) => {
      if (err) return callback(null)
      del.addDelete(data, (err) => {
        if (err) return callback(null)
        return callback(true)
      })
    })
  })
}

export const score = {
  loadScore,
  loadScoreAll,
  loadData,
  loadLatest,
  checkData,
  addScore,
  modifyScore,
  searchInput,
  deleteScore,
}
