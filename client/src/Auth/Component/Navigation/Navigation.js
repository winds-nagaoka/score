import React, { Component } from 'react'
import { Route, Link, Redirect } from 'react-router-dom'

import { titleStore, backNavigation } from '../../../Component/Flux/Stores'

import { confirmAlert } from 'react-confirm-alert'

import lib from '../../../Component/Library/Library'

import './Navigation.css'

export default class Navigation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      load: undefined,
      redirect: undefined,
      title: undefined,
      titleBar: undefined,

      backNavigation: false,
      backTo: undefined,
    }
    titleStore.update = () => {
      this.setState({load: true, title: titleStore.title, titleBar: titleStore.bar})
    }
    backNavigation.update = () => {
      this.setState({backNavigation: backNavigation.show, backTo: backNavigation.to})
    }
  }

  menuToggle () {
    this.setState({open: !this.state.open})
  }

  closeMenu () {
    this.setState({open: false})
  }

  logout () {
    this.setState({open: false})
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>ログアウトしますか？</h1>
            <p>ログインデータは端末から削除されます。</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                window.localStorage.clear()
                this.setState({redirect: '/'})
                // Actions.toastShow('ログアウトしました')
                onClose()
              }}>OK</button>
            </div>
          </div>
        )
      }
    })
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const menuContentClass = this.state.open ? 'menu-content open' : 'menu-content'
    const menuBackgroundClass = this.state.open ? 'menu-background open' : 'menu-background'
    const title = this.state.load ? this.state.title : '読み込み中'
    const headerClass = this.state.load && this.state.titleBar ? 'header no-border' : 'header'
    const backNavAndMenuToggle = this.state.backNavigation ? <div className='label back'><Link to={this.state.backTo}><i className='fas fa-chevron-left'></i>戻る</Link></div> : <div className='label' onClick={() => this.menuToggle()}><i className='fas fa-bars fa-lg'></i></div>
    const status = lib.getUserAdmin(this.props.user)
    return (
      <div className='member-menu'>
        <div className={headerClass}>
          <div className='title'>
            <p>{title}</p>
          </div>
        </div>
        {backNavAndMenuToggle}
        <div className={menuBackgroundClass} onClick={() => this.menuToggle()}></div>
        <div className={menuContentClass}>
          <div className='account-info'>
            <img src='https://winds-n.com/img/apple-icon-score.png' alt='logo' />
            <span>ウィンズスコア</span>
          </div>
          <ol>
            <li><CustomLink activeOnlyWhenExact={true} to='/score' label='ホーム' icon='fas fa-home' onClick={() => this.closeMenu()} /></li>
            {status ? <li><CustomLink to='/score/add' label='新しい楽譜を追加' icon='fas fa-plus-circle' onClick={() => this.closeMenu()} /></li> : ''}
            {status ? <li><CustomLink to='/score/box' label='楽譜管理箱' icon='fas fa-archive' onClick={() => this.closeMenu()} /></li> : ''}
            <li><CustomLink to='/score/csv' label='CSV出力' icon='fas fa-file-excel' onClick={() => this.closeMenu()} /></li>
            <li><CustomLink to='/score/setting' label='設定' icon='fas fa-cog' onClick={() => this.closeMenu()} /></li>
          </ol>
          <ol>
            <li><div className='logout' onClick={() => this.logout()}><div><i className='fas fa-sign-out-alt'></i>ログアウト</div></div></li>
            {/* <CustomLink to='/score/logout' label='ログアウト' icon='fas fa-sign-out-alt' onClick={() => this.logout()} /> */}
          </ol>
        </div>
      </div>
    )
  }
}

const CustomLink = ({ label, icon, to, activeOnlyWhenExact, onClick }) => {
  return (
    <Route
      path={to}
      exact={activeOnlyWhenExact}
      children={({ match }) => (
        <div className={match ? 'active' : ''}>
          <Link to={to} onClick={() => onClick()} onTouchStart={() => {}}><div><i className={icon}></i>{label}</div></Link>
        </div>
      )}
    />
  )
}