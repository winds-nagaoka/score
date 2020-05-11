import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../Component/Flux/Actions'

import './Reg.css'

export default class Reg extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: '',
      pass: '',
      key: '',
      sending: true,
      redirect: '',
      errorMessage: ''
    }
  }

  addUser (e) {
    e.preventDefault()
    if (this.state.user === '' || this.state.pass === '') {
      return this.setState({errorMessage: 'ユーザー名とパスワードを入力してください'})
    }
    if (this.state.user.length <= 2) {
      return this.setState({errorMessage: 'ユーザー名は3文字以上で入力してください'})
    }
    this.setState({sending: false})
    request.post('/api/adduser')
      .type('form')
      .send({
        userid: this.state.user,
        passwd: this.state.pass,
        key: this.state.key
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
          this.setState({sending: true, redirect: '/score'})
          // 処理順によって表示できない
          Actions.toastShow('新しいユーザーの登録が完了しました')
          return
        }
        // 登録できない場合
        this.setState({sending: true, errorMessage: '登録失敗しました', pass: ''})
      })
  }

  keyPress (e) {
    if (e.which === 13) this.addUser(e)
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
    const buttonText = this.state.sending ? '新規登録' : <i className="fas fa-spinner fa-pulse"></i>
    return (
      <div className='reg'>
        <div className='link'>
          <Link to='/'><span>ログイン</span></Link>
          <div><span>新規登録</span></div>
        </div>
        <div className='form'>
          <form>
            <label htmlFor='reg-user-input'>ユーザー名</label>
            <input type='text' value={this.state.user} id='reg-user-input' onChange={(e) => changed('user', e)} onKeyPress={(e) => this.keyPress(e)} placeholder='ユーザー名' />
            <label htmlFor='reg-pass-input'>パスワード</label>
            <input type='password' value={this.state.pass} id='reg-pass-input' onChange={(e) => changed('pass', e)} onKeyPress={(e) => this.keyPress(e)} placeholder='パスワード' />
            <label htmlFor='reg-key-input'>承認キー</label>
            <input type='text' value={this.state.key} id='reg-key-input' onChange={(e) => changed('key', e)} onKeyPress={(e) => this.keyPress(e)} placeholder='承認キー' />
            {errorMessage}
            <button onClick={(e) => this.addUser(e)} disabled={disable}>{buttonText}</button>
          </form>
        </div>
      </div>
    )
  }
}