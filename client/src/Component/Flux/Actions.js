import { appDispatcher } from './Dispatcher'

import req from '../Request/Request'

export const ActionType = {
  DISPLAY_TITLE: 'DISPLAY_TITLE',
  BACK_NAVIGATION: 'BACK_NAVIGATION',
  LOAD_LIST: 'LOAD_LIST',
  LOAD_USERDATA: 'LOAD_USERDATA',
  TOAST_SHOW: 'TOAST_SHOW'
}

export const Actions = {
  updateTitle: (title, bar) => {
    appDispatcher.dispatch({
      actionType: ActionType.DISPLAY_TITLE,
      title: title,
      bar: bar
    })
  },
  backNavigation: (show, to) => {
    appDispatcher.dispatch({
      actionType: ActionType.BACK_NAVIGATION,
      show,
      to
    })
  },
  loadList: (query) => {
    req.loadList(query, (list) => {
      appDispatcher.dispatch({
        actionType: ActionType.LOAD_LIST,
        query,
        list
      })
    })
  },
  loadUser: () => {
    req.loadUser((user) => {
      appDispatcher.dispatch({
        actionType: ActionType.LOAD_USERDATA,
        user
      })
    })
  },
  toastShow: (message) => {
    appDispatcher.dispatch({
      actionType: ActionType.TOAST_SHOW,
      message: message
    })
  }
}