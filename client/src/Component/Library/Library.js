const version = '0.2.6'

function getVersion () {
  return version
}

function unixTimeFull (intTime) {
  var d = new Date(intTime)
  var year = d.getFullYear()
  var month = d.getMonth() + 1
  var day = d.getDate()
  var hour = ('0' + d.getHours()).slice(-2)
  var min = ('0' + d.getMinutes()).slice(-2)
  // var sec = ('0' + d.getSeconds()).slice(-2)
  return (year + '/' + month + '/' + day + ' ' + hour + ':' + min)
}

function getYear () {
  var d = new Date()
  var year = d.getFullYear()
  return (year)
}

function unixDate (intTime) {
  var d = new Date(intTime)
  var year = d.getFullYear()
  var month = d.getMonth() + 1
  var day = d.getDate()
  return (year + '/' + month + '/' + day)
}

function unixTime (intTime) {
  var d = new Date(intTime)
  var hour = ('0' + d.getHours()).slice(-2)
  var min  = ('0' + d.getMinutes()).slice(-2)
  return (hour + ':' + min);
}

function makeLine (array) {
  var s = ''
  for (var i = 0; i<array.length; i++) {
    s += array[i] + ', '
  }
  s = s.slice(0, -2)
  // if (s === '') {
  //   s = 'No Data'
  // }
  return s
}

function objectDiff (obj1, obj2) {
  var flag = false
  // var keys = Object.keys(obj1)
  // var props = Object.getOwnPropertyNames(obj1)
  for (var each in obj1) {
    if (Array.isArray(obj1[each])) {
      var array1 = obj1[each]
      var array2 = obj2[each]
      for (var resp in obj1[each]) {
        if (array1[resp] !== array2[resp]) flag = true
      }
    } else {
      if (obj1[each] !== obj2[each]) flag = true
    }
  }
  return flag
}

function getUserAdmin (user) {
  if ('admin' in user) {
    // console.log('admin status: ',user.admin)
    if (user.admin === 'true') {
      return true
    } else {
      return false
    }
  } else {
    // console.log('admin status: ', false)
    return false
  }
}

module.exports = {
  getVersion,
  unixTimeFull, getYear, unixDate, unixTime, makeLine, objectDiff, getUserAdmin
}