import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import TextModify from '../Component/TextModify/TextModify'

import lib from '../../../Component/Library/Library'

import './SettingMail.css'

export default class SettingMail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      redirect: '',
      load: undefined,
      status: undefined,
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.user, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('メールアドレスの設定')
    Actions.backNavigation(true, '/score/setting')
    userStore.status === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  emailChanged () {
    Actions.loadUser()
    Actions.toastShow('メールアドレスを変更しました')
    this.setState({redirect: '/score/setting'})
  }

  canceled () {
    this.setState({redirect: '/score/setting'})
  }

  formRender () {
    if (this.state.load) {
      const email = this.state.user.email ? this.state.user.email : ''
      return (
        <div>
          <TextModify
            api='/api/setting/email'
            text={email}
            title='メールアドレス'
            onChange={() => this.emailChanged()}
            onCancel={() => this.canceled()}
          />
        </div>
      )
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const form = this.formRender()
    return (
      <div className='setting-email'>
        {form}
      </div>
    )
  }
}