import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

import { confirmAlert } from 'react-confirm-alert'

import { Actions } from '../../../Component/Flux/Actions'
import { userStore } from '../../../Component/Flux/Stores'

import './SettingList.css'

export default class SettingList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      redirect: '',
      status: undefined,
      load: undefined,
      user: {}
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.user, load: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('設定')
    Actions.backNavigation(false)
    userStore.user === undefined ? Actions.loadUser() : this.setState({user: userStore.user, load: true})
  }

  render () {
    if (!this.state.load) {
      return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    }
    const name = this.state.user.name ? this.state.user.name : '未設定'
    const email = this.state.user.email ? this.state.user.email : '未設定'
    return (
      <div className='setting-list'>
        <div className='link-frame'>
          <label>アカウント設定</label>
          <div className='links'>
            {/* <Link to='/score/setting/name'>
              <span>名前</span><span>{name}</span><span><i className="fas fa-chevron-right"></i></span>
            </Link> */}
            <Link to='/score/setting/email'>
              <span>メールアドレス変更</span><span>{email}</span><span><i className="fas fa-chevron-right"></i></span>
            </Link>
            <Link to='/score/setting/password'>
              <span>パスワード変更</span><span></span><span><i className="fas fa-chevron-right"></i></span>
            </Link>
            <Link to='/score/setting/delete'>
              <span>アカウント削除</span><span></span><span><i className="fas fa-chevron-right"></i></span>
            </Link>
          </div>
        </div>
        <div className='link-frame'>
          <label>情報</label>
          <div className='links'>
            <Link to='/score/setting/license'>
              <span>ライセンス</span><span></span><span><i className="fas fa-chevron-right"></i></span>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}