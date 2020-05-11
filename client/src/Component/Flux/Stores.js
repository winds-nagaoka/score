import { appDispatcher } from './Dispatcher'
import { ActionType } from './Actions'

// export const statusStore = {
//   status: undefined,
//   redirect: undefined,
//   onLoad: null
// }

export const titleStore = {title: undefined, bar: undefined}
export const backNavigation = {show: undefined, to: undefined}
export const scoreStore = {list: undefined, query: undefined}
export const userStore = {user: undefined}
// export const listLoadStore = {uploadPayment: null}
// export const latestStore = {deletePayment: null}
export const toastStore = {message: undefined, show: null}

appDispatcher.register(payload => {
  if (payload.actionType === ActionType.DISPLAY_TITLE) {
    titleStore.title = payload.title
    titleStore.bar = payload.bar
    titleStore.update()
  }
})
appDispatcher.register(payload => {
  if (payload.actionType === ActionType.BACK_NAVIGATION) {
    backNavigation.show = payload.show
    backNavigation.to = payload.to
    backNavigation.update()
  }
})
appDispatcher.register(payload => {
  if (payload.actionType === ActionType.LOAD_LIST) {
    scoreStore.list = payload.list
    scoreStore.query = payload.query
    scoreStore.onLoad()
  }
})
appDispatcher.register(payload => {
  if (payload.actionType === ActionType.LOAD_USERDATA) {
    userStore.user = payload.user
    userStore.onLoad()
  }
})
appDispatcher.register(payload => {
  if (payload.actionType === ActionType.TOAST_SHOW) {
    toastStore.message = payload.message
    toastStore.show()
  }
})