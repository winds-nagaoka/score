import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'
import Modal from 'react-modal'
import { confirmAlert } from 'react-confirm-alert'

import { Actions } from '../../Component/Flux/Actions'
import { userStore } from '../../Component/Flux/Stores'
import lib from '../../Component/Library/Library'

import './BoxManagement.css'

export default class BoxManagement extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      redirect: undefined,
      list: [],
      showDisable: false,

      // Modal
      detailOpen: false,
      detailContent: undefined,
      modifyLocateText: '',

      user: {},
      userLoad: undefined
    }
    this.openDetail = this.openDetail.bind(this)
    this.closeDetail = this.closeDetail.bind(this)
    userStore.onLoad = () => {
      this.setState({user: userStore.user, userLoad: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('楽譜管理箱')
    userStore.user === undefined ? Actions.loadUser() : this.setState({user: userStore.user, userLoad: true})
    this.loadList()
  }

  loadList () {
    this.setState({load: false})
    request.post('/api/box')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token
      })
      .end((err, res) => {
        if (err) return
        if (res.body.status) {
          return this.setState({list: res.body.list, load: true})
        }
      })
  }

  addBox(e) {
    e.preventDefault()
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>新しい箱を追加します</h1>
            <p>古い箱が満杯になったら追加してください</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.addRequest()
                onClose()
              }}>確認</button>
            </div>
          </div>
        )
      }
    })
  }

  addRequest () {
    this.setState({load: false})
    request.post('/api/box/add')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token
      })
      .end((err, res) => {
        if (res.body.status) {
          Actions.toastShow('新しい箱を追加しました')
          this.loadList()
        }
      })
  }

  modifyBox (e, id) {
    e.preventDefault()
    this.setState({load: false})
    request.post('/api/box/modify')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id,
        locate: this.state.modifyLocateText
      })
      .end((err, res) => {
        if (res.body.status) {
          this.setState({detailOpen: false})
          this.loadList()
        }
      })
  }

  deleteBox (e, id) {
    e.preventDefault()
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>この箱を削除しますか？</h1>
            <p>この箱のラベルは欠番となります</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.deleteRequest(id)
                onClose()
              }}>削除</button>
            </div>
          </div>
        )
      }
    })
  }

  backBox (e, id) {
    e.preventDefault()
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>この箱を使用しますか？</h1>
            <p>この箱のラベルは再使用されます</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.deleteRequest(id)
                onClose()
              }}>戻す</button>
            </div>
          </div>
        )
      }
    })
  }

  deleteRequest (id) {
    this.setState({load: false})
    request.post('/api/box/delete')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id
      })
      .end((err, res) => {
        if (res.body.status) {
          this.setState({detailOpen: false})
          this.loadList()
        }
      })
  }

  showDisable (e) {
    e.preventDefault()
    this.setState({showDisable: !this.state.showDisable})
  }

  openDetail (e, each) {
    e.preventDefault()
    const modifyLocateText = each.locate ? each.locate : ''
    this.setState({detailOpen: true, detailContent: each, modifyLocateText})
  }

  closeDetail (e) {
    e.preventDefault()
    this.setState({detailOpen: false, detailContent: undefined, modifyLocateText: ''})
  }

  detailBoxContent () {
    if (!this.state.detailContent) return
    const status = lib.getUserAdmin(this.state.user)
    const label = this.state.detailContent.label ? <span className='label'>{this.state.detailContent.label}</span> : <span className='no-data'>No Data</span>
    const locate = !this.state.detailContent.locate ? <span className='no-data'>未設定</span> : <span className='locate'>{this.state.detailContent.locate}</span>
    const deleteButton = this.state.detailContent.status ? <button onClick={(e) => this.deleteBox(e, this.state.detailContent._id)}>この箱を削除</button>: <button onClick={(e) => this.backBox(e, this.state.detailContent._id)}>この箱を再使用</button>
    const buttonDisabled = this.state.detailContent.locate === this.state.modifyLocateText ? true : false
    return (
      <div className='detail-content'>
        <div className='flex-frame'>
          <div className='box-label'>
            {label}
          </div>
          <div className='detail-information'>
            <label>保管場所</label><span>{locate}</span>
            {status ? <label>保管場所の変更</label> : ''}
            {status ? <input type='text' value={this.state.modifyLocateText} onChange={(e) => this.setState({modifyLocateText: e.target.value})} /> : ''}
          </div>
        </div>
        <div className='buttons'>
          {status ? deleteButton : ''}
          {status ? <button onClick={(e) => this.modifyBox(e, this.state.detailContent._id)} disabled={buttonDisabled}>修正を反映</button> : ''}
        </div>
      </div>
    )
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const loading = this.state.load ? '' : <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    const status = lib.getUserAdmin(this.state.user)
    const endLabel = this.state.load ? this.state.list.length === 0 ? '保管箱はありません' : 'No More Box' : ''
    const detailBoxModalContent = this.detailBoxContent()
    const list = this.state.list.map((each, i) => {
      if (!each.status && !this.state.showDisable) return
      const locate = !each.locate ? '未設定' : each.locate
      const statusClass = each.status ? 'box' : 'box disabled'
      return (
        <div key={each._id} className={statusClass} onTouchStart={() => {}} onClick={(e) => {this.openDetail(e, each)}}>
          <div className='label'><span>{each.label}</span></div>
          <i className="fas fa-archive"></i>
          <div className='locate'><span>{locate}</span></div>
        </div>
      )
    })
    return (
      <div className='box-management'>
        <div className='pre'>
          <p>楽譜保管箱のラベルと保管場所です。</p>
          {status ? <p>新しい箱を追加するとラベルが自動的に割り振られます。割り振られたラベルを変更することはできません。</p> : ''}
        </div>
        {loading}
        <div className='box-list'>
          {list}
        </div>
        <div className='end-label'>{endLabel}</div>
        <div className='buttons'>
          {status ? <button onClick={(e) => this.addBox(e)} className='add-box'>新しい箱を追加</button> : ''}
          {status ? <button onClick={(e) => this.showDisable(e)} className='add-box'>削除した箱を表示</button> : ''}
        </div>
        <Modal
          isOpen={this.state.detailOpen}
          onRequestClose={this.closeDetail}
          contentLabel='deteilBox'
          className='modal-detail-box'
          overlayClassName='modal-detail-box-overlay'
          ariaHideApp={false}
        >
        <div>
          <div className='modal-header'>
            <div>詳細</div>
            <div><button onClick={(e) => this.closeDetail(e)} className='close'>&times;</button></div>
          </div>
          {detailBoxModalContent}
        </div>
        </Modal>
      </div>
    )
  }
}