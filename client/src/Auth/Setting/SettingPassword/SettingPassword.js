import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import lib from '../../../Component/Library/Library'

import './SettingPassword.css'

export default class SettingPassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      redirect: '',
      phase: 0,
      user: {},
      // 確認時表示用
      passShow: false,
      load: '',
      status: '',
      oldPassword: '',
      newPassword: ''
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.status, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('パスワードの変更')
    Actions.backNavigation(true, '/score/setting')
    userStore.status === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  keyPress (e) {
    if (e.which === 13) this.changePassword(e)
  }

  cancel (e) {
    e.preventDefault()
    this.setState({redirect: '/score/setting'})
  }

  changePassword (e) {
    e.preventDefault()
    if (!this.state.oldPassword) return
    if (!this.state.newPassword) return
    this.setState({load: false})
    request.post('/api/setting/password')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        old: this.state.oldPassword,
        new: this.state.newPassword
      })
      .end((err, res) => {
        if (err) return
        if (res.body.error === 'oldPassWrong') {
          this.setState({
            load: true
          })
        }
        if (res.body.status) {
          this.setState({
            phase: 1,
            load: true
          })
          Actions.toastShow('パスワードを変更しました')
        }
      })
  }

  phase () {
    if (this.state.phase === 0) {
      return (
        <div className='form'>
          <label>現在のパスワード</label>
          <input type='password' value={this.state.oldPassword} onChange={(e) => this.setState({oldPassword: e.target.value})} onKeyPress={(e) => this.keyPress(e)} placeholder='現在のパスワード' />
          <label>新しいパスワード</label>
          <input type='password' value={this.state.newPassword} onChange={(e) => this.setState({newPassword: e.target.value})} onKeyPress={(e) => this.keyPress(e)} placeholder='新しいパスワード' />
          <div>
            <button onClick={(e) => this.changePassword(e)} className='save'>保存</button>
            <button onClick={(e) => this.cancel(e)} className='cancel'>キャンセル</button>
          </div>
        </div>
      )
    } else if (this.state.phase === 1) {
      const pass = this.state.passShow ? this.state.newPassword : this.state.newPassword.replace(/./g, '*')
      return (
        <div className='form'>
          <div>
            <p>パスワードを変更しました</p>
            <div>
              {pass}
            </div>
            <button onClick={() => this.setState({passShow: !this.state.passShow})}>表示</button>
          </div>
          <div>
            <button onClick={(e) => this.cancel(e)} className='cancel'>戻る</button>
          </div>
        </div>
      )
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const form = this.phase()
    return (
      <div className='setting-password'>
        {form}
      </div>
    )
  }
}