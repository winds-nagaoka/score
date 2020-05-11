import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import lib from '../../../Component/Library/Library'

import './SettingAdmin.css'

export default class SettingAdmin extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      user: {},
      requestLoad: true
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.user, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('管理者登録')
    Actions.backNavigation(true, '/score/setting')
    userStore.user === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  sendRequest (e) {
    e.preventDefault()
    this.setState({requestLoad: false})
    request.post('/api/setting/admin')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        request: !lib.getUserAdmin(this.state.user)
      })
      .end((err, res) => {
        if (err) return
        if (res.body.status) {
          Actions.loadUser()
          this.setState({
            requestLoad: true
          })
        }
      })
  }


  render () {
    if (!this.state.load) {
      return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    }
    const status = lib.getUserAdmin(this.state.user) ? 'You are Administrator!' : 'General'
    const disable = this.state.requestLoad ? false : true
    const buttonText = this.state.requestLoad ? '切り替え' : <i className="fas fa-spinner fa-pulse"></i>

    return (
      <div className='setting-admin'>
        <div className='status'>
          <p>{this.state.user.name}</p>
          <p>{status}</p>
        </div>
        <button onClick={(e) => this.sendRequest(e)} disabled={disable}>{buttonText}</button>
      </div>
    )
  }
}