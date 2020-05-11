import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'

import Login from './Login/Login'
import Reg from './Reg/Reg'

import { Actions } from '../Component/Flux/Actions'

import Toast from '../Component/Toast/Toast'
import lib from '../Component/Library/Library'
import Horn from '../Component/Logo/hr.svg'
import Logo from '../Component/Logo/logo.svg'

import './Base.css'

export default class Base extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      redirect: ''
    }
  }

  componentWillMount () {
    this.loginAuth()
  }

  loginAuth () {
    if (!window.localStorage.user || !window.localStorage.token) return this.setState({load: true})
    request
      .post('/api/auth')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token
      })
      .end((err, res) => {
        if (err) return this.setState({load: true})
        if (!res.body.status) return this.setState({load: true})
        this.setState({redirect: '/score'})
      })
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) {
      return (
        <div className='base'>
          <Toast />
        </div>
      )
    }
    return (
      <div className='base'>
        <Toast />
        <main>
          <div className='header'>
            <Horn />
            <span><span><Logo /></span><span>ウィンズスコア</span></span>
          </div>
        </main>
        {/* <div className='header'><Logo /><span>楽譜管理アプリ</span></div> */}
        <Switch>
          <Route exact path='/' component={Login} />
          <Route path='/reg' component={Reg} />
        </Switch>
        <div className='footer'><span>&copy; </span><span className='name'>{lib.getYear()} The Wind Ensemble</span></div>
      </div>
    )
  }
}