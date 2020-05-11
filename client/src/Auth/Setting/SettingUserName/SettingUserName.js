import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import TextModify from '../Component/TextModify/TextModify'

import lib from '../../../Component/Library/Library'

import './SettingUserName.css'

export default class SettingUserName extends Component {
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
    Actions.updateTitle('名前の設定')
    Actions.backNavigation(true, '/score/setting')
    userStore.status === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  nameChanged () {
    Actions.loadUser()
    Actions.toastShow('名前を変更しました')
    this.setState({redirect: '/score/setting'})
  }

  canceled () {
    this.setState({redirect: '/score/setting'})
  }

  formRender () {
    if (this.state.load) {
      return (
        <div>
          <TextModify
            api='/api/setting/username'
            text={this.state.user.name}
            title='名前'
            onChange={() => this.nameChanged()}
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
      <div className='setting-username'>
        {form}
      </div>
    )
  }
}