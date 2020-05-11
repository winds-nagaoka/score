import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../Component/Flux/Actions'

import Toast from '../Component/Toast/Toast'

import Navigation from './Component/Navigation/Navigation'
import Home from './Home/Home'
import Edit from './Edit/Edit'
import Detail from './Detail/Detail'
import BoxManagement from './BoxManagement/BoxManagement'
import SendMail from './SendMail/SendMail'
import Setting from './Setting/Setting'

import lib from '../Component/Library/Library'

import './Auth.css'

export default class Auth extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      redirect: '',
      user: {}
    }
  }

  componentWillMount () {
    this.loginAuth()
  }

  loginAuth () {
    if (!window.localStorage.token) {
      window.alert('ログインが必要です')
      this.setState({redirect: '/'})
      return
    }
    request
      .post('/api/auth')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        version: lib.getVersion()
      })
      .end((err, res) => {
        if (err) {
          window.alert('認証エラーです')
          this.setState({redirect: '/'})
          return
        }
        if (!res.body.status) {
          window.alert('ログインしてください')
          this.setState({redirect: '/'})
          return
        }
        this.setState({user: res.body.user, load: true})
      })
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) {
      return (
        <div className='auth'>
          <Toast />
        </div>
      )
    }
    return (
      <div className='auth'>
        <Toast />
        <Navigation user={this.state.user} />
        <div className='contents'>
          <Switch>
            <Route exact path='/score' component={Home} />
            <Route path='/score/add' component={Edit} />
            <Route path='/score/detail/:id' component={Detail} />
            <Route path='/score/edit/:id' component={Edit} />
            <Route path='/score/box' component={BoxManagement} />
            <Route path='/score/csv' component={SendMail} />
            <Route path='/score/setting' component={Setting} />
          </Switch>
        </div>
      </div>
    )
  }
}