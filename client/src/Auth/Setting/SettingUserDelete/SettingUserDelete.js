import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import request from 'superagent'

import { confirmAlert } from 'react-confirm-alert'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import './SettingUserDelete.css'

export default class SettingUserDelete extends Component {
  constructor (props) {
    super(props)
    this.state = {
      redirect: '',
      user: {},
      load: undefined,
      status: '',
      // 入力されたパスワード
      password: ''
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.status, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('アカウントの削除')
    Actions.backNavigation(true, '/setting')
    userStore.status === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  keyPress (e) {
    if (e.which === 13) this.changePassword(e)
  }

  cancel (e) {
    e.preventDefault()
    this.setState({redirect: '/setting'})
  }

  userDelete () {
    this.setState({load: false})
    request.post('/api/setting/delete')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        pass: this.state.password
      })
      .end((err, res) => {
        if (err) return
        if (res.body.status) {
          // 削除完了
          window.localStorage.clear()
          this.setState({
            load: true,
            redirect: '/'
          })
          // Actions.toastShow('アカウントを削除しました')
        }
        this.setState({
          load: true,
          password: ''
        })
        return // Actions.toastShow('パスワードが合っていません')
      })
  }

  deleteConfirm (e) {
    e.preventDefault()
    if (!this.state.password) return
    this.setState({open: false})
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>アカウントを削除しますか？</h1>
            <p>関連データは完全に削除されます。</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.userDelete()
                onClose()
              }}>削除</button>
            </div>
          </div>
        )
      }
    })
  }

  formRender () {
    if (this.state.load) {
      return (
        <div className='form'>
          <label>パスワード</label>
          <input type='password' value={this.state.password} onChange={(e) => this.setState({password: e.target.value})} onKeyPress={(e) => this.keyPress(e)} placeholder='パスワード' />
          <div>
            <button onClick={(e) => this.deleteConfirm(e)} className='save'>アカウント削除</button>
            <button onClick={(e) => this.cancel(e)} className='cancel'>キャンセル</button>
          </div>
        </div>
      )
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) return <div className='setting-user-delete'><div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div></div>
    const form = this.formRender()
    return (
      <div className='setting-user-delete'>
        {form}
      </div>
    )
  }
}