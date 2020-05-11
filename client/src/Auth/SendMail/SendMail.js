import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'
import { confirmAlert } from 'react-confirm-alert'

import { Actions } from '../../Component/Flux/Actions'
import { userStore } from '../../Component/Flux/Stores'

import './SendMail.css'

export default class SendMail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      redirect: undefined,
      count: false,
      text: ''
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.user, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('CSV出力')
    userStore.status === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
    this.count()
  }

  count () {
    this.setState({load: false})
    request.post('/api/count')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
      })
      .end((err, res) => {
        if (err) this.setState({load: true})
        if (res.body.status) {
          this.setState({load: true, count: res.body.count})
        }
      })
  }

  sendmail () {
    this.setState({load: false})
    if (!this.state.user.email) {
      this.setState({load: true})
      return Actions.toastShow('メールアドレスを設定してください')
    }
    request.post('/api/sendmail')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        to: this.state.user.email,
        name: this.state.user.name,
        subject: 'ウィンズスコア',
        body: 'ウィンズが保管している楽譜データをお送りします。\r\n'
            + 'CSV形式で記録されています。\r\n'
            + '直接Excelで開くと文字化けするため\r\n'
            + '一度Googleスプレッドシードなどで開き\r\n'
            + '上書き保存してからご利用ください。\r\n'
      })
      .end((err, res) => {
        if (err) return Actions.toastShow('ネットワーク接続を確認してください')
        const response = res.body
        if (response.status) {
          this.setState({load: true})
          return Actions.toastShow('メールを送信しました')
        } else {
          this.setState({load: true})
          return Actions.toastShow('エラーが発生しました')
        }
      })
  }

  sendRequest (e) {
    e.preventDefault()
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>メールを送信します</h1>
            <p></p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.sendmail()
                onClose()
              }}>送信</button>
            </div>
          </div>
        )
      }
    })
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) {
      return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    }
    const email = this.state.user.email ? this.state.user.email : 'メールアドレスを登録してください'
    const buttonDisabled = this.state.user.email ? false : true
    return (
      <div className='send-mail'>
        <div className='pre'>
          <p>楽譜一覧データをCSV形式で登録されたメールアドレスに送信します。</p>
        </div>
        <div className='count'>
          <p>現在の登録数は <span>{this.state.count ? (this.state.count + '件') : '計算中...'}</span> です。</p>
        </div>
        <div className='address'>
          <p>{email}</p>
        </div>
        <div className='pre'>
          <p>メールアドレスを確認後、送信ボタンを押してください。</p>
        </div>
        <div className='button'>
          <button onClick={(e) => this.sendRequest(e)} disabled={buttonDisabled}>送信</button>
        </div>
      </div>
    )
  }
}