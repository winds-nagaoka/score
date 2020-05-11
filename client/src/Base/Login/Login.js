import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../Component/Flux/Actions'

import './Login.css'

export default class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: '',
      pass: '',
      sending: true,
      redirect: '',
      errorMessage: ''
    }
  }

  login (e) {
    e.preventDefault()
    if (this.state.user === '' || this.state.pass === '') {
      this.setState({errorMessage: 'ユーザー名とパスワードを入力してください'})
      return
    }
    this.setState({sending: false})
    request.post('/api/login')
      .type('form')
      .send({
        userid: this.state.user,
        passwd: this.state.pass
      })
      .end((err, res) => {
        if (err) {
          this.setState({sending: true, errorMessage: '接続できませんでした'})
          return
        }
        const response = res.body
        if (response.status && response.token) {
          window.localStorage['user'] = this.state.user
          window.localStorage['token'] = response.token
          window.localStorage['key'] = response.key
          this.setState({sending: true, redirect: '/score'})
          // 処理順によって表示できない
          Actions.toastShow('ログインしました')
          return
        }
        this.setState({sending: true, errorMessage: 'ログインできませんでした'})
      })
  }

  keyPress (e) {
    if (e.which === 13) this.login(e)
  }

  errorMessageShow () {
    if (this.state.errorMessage) {
      return (
        <div className='error-message'>
          {this.state.errorMessage}
        </div>
      )
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const changed = (name, e) => this.setState({[name]: e.target.value})
    const errorMessage = this.errorMessageShow()
    const disable = this.state.sending ? false : true
    const buttonText = this.state.sending ? 'ログイン' : <i className="fas fa-spinner fa-pulse"></i>
    return (
      <div className='login'>
        <div className='link'>
          <div><span>ログイン</span></div>
          <Link to='/reg'><span>新規登録</span></Link>
        </div>
        <div className='form'>
          <form>
            <label htmlFor='login-user-input'>ユーザー名</label>
            <input type='text' value={this.state.user} id='login-user-input' onChange={(e) => changed('user', e)} onKeyPress={(e) => this.keyPress(e)} placeholder='ユーザー名' />
            <label htmlFor='login-pass-input'>パスワード</label>
            <input type='password' id='login-pass-input' value={this.state.pass} onChange={(e) => changed('pass', e)} onKeyPress={(e) => this.keyPress(e)} placeholder='パスワード' />
            {errorMessage}
            {/* <button onClick={(e) => this.login(e)} onTouchStart={() => {}} disabled={disable}>{buttonText}</button> */}
            <button onClick={(e) => this.login(e)} onTouchStart={() => {}} disabled={disable}>{buttonText}</button>
          </form>
        </div>
      </div>
    )
  }
}