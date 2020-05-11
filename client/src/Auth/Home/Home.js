import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'
import DetailModal from 'react-modal'

import { Actions } from '../../Component/Flux/Actions'
import { scoreStore, userStore } from '../../Component/Flux/Stores'
import lib from '../../Component/Library/Library'

import './Home.css'

export default class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load: undefined,
      redirect: undefined,
      list: [],
      searchLoad: true,
      queryText: '',
      // /^box[-:]\s?/ で検索したときに有効
      boxMode: false,

      // Modal
      detailOpen: false,
      detailContent: undefined,

      user: {},
      userLoad: undefined
    }
    this.openDetail = this.openDetail.bind(this)
    this.closeDetail = this.closeDetail.bind(this)
    scoreStore.onLoad = () => {
      this.setState({list: scoreStore, load: true, searchLoad: true})
    }
    userStore.onLoad = () => {
      this.setState({user: userStore.user, userLoad: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('ホーム', true)
    Actions.backNavigation(false)
    // localStorage初期化
    window.localStorage['loadList'] = 0
    scoreStore.list === undefined ? Actions.loadList() : this.setState({list: scoreStore.list, load: true})
    scoreStore.query === undefined ? this.setState({queryText: ''}) : this.setState({queryText: scoreStore.query})
    userStore.user === undefined ? Actions.loadUser() : this.setState({user: userStore.user, userLoad: true})
  }

  keyPress (e) {
    if (e.which === 13) Actions.loadList(this.state.queryText)
  }

  search (e) {
    // const queryText = this.state.queryText
    Actions.loadList(e.target.value)
    if (e.target.value.match(/^box[-:]\s?/i)) {
      Actions.updateTitle('楽譜管理箱: ' + e.target.value.replace(/^box[-:]\s?/ig, '').toUpperCase(), true)
      var boxMode = true
    } else {
      Actions.updateTitle('ホーム', true)
      var boxMode = false
    }
    this.setState({queryText: e.target.value, searchLoad: false, boxMode})
  }

  resetSearch () {
    Actions.loadList()
    Actions.updateTitle('ホーム', true)
    this.setState({queryText: '', searchLoad: false, boxMode: false})
    this.searchBox.focus()
  }

  openDetail (e, each) {
    e.preventDefault()
    this.setState({detailOpen: true, detailContent: each})
  }

  closeDetail (e) {
    e.preventDefault()
    this.setState({detailOpen: false, detailContent: undefined})
  }

  detailContent () {
    if (!this.state.detailContent) return
    const titleJa = this.state.detailContent.titleJa ? <span className='title-ja'>{this.state.detailContent.titleJa}</span> : <span className='no-data'>No Data</span>
    const titleEn = this.state.detailContent.titleEn ? <span className='title-en'>{this.state.detailContent.titleEn}</span> : <span className='no-data'>No Data</span>
    const composer = this.state.detailContent.composer[0] !== '' ? <span className='composer'>{lib.makeLine(this.state.detailContent.composer)}</span> : <span className='composer no-data'>No Data</span>
    const arranger = this.state.detailContent.arranger[0] !== '' ? <span className='arranger'>{lib.makeLine(this.state.detailContent.arranger)}</span> : <span className='arranger no-data'>No Data</span>
    const storageStatus = () => {
      if (this.state.detailContent.scoreStatus === '2') {
        return <span className='status lend'>貸出中</span>
      } else if (this.state.detailContent.scoreStatus === '1') {
        return <span className='status use'>使用中</span>
      } else {
        return <span className='status storage'>保管</span>
      }
    }
    return (
      <div className='detail-content'>
        <div className='detail-frame'>
          <div>
            <label>保管状況</label>
            <div className='score-status'>{storageStatus()}</div>
          </div>
          <div>
            <label>楽譜管理番号</label>
            <div className='locate'>
              {lib.getUserAdmin(this.state.user) ? <span className='box-label'>{this.state.detailContent.boxLabel}</span> : ''}
              <span className='score-number'>{this.state.detailContent.label}</span>
            </div>
          </div>
        </div>
        <div className='detail-text'><label>タイトル(日本語)</label>{titleJa}</div>
        <div className='detail-text'><label>タイトル(英語)</label>{titleEn}</div>
        <div className='detail-frame'>
          <div><label>作曲者</label>{composer}</div>
          <div><label>編曲者</label>{arranger}</div>
        </div>
        <div className='links'>
          <Link to={'/score/detail/' + this.state.detailContent._id}><i className="fas fa-info-circle"></i>詳細を表示</Link>
        </div>
      </div>
    )
  }

  renderList () {
    if (this.state.load && this.state.userLoad) {
      if (!this.state.list) return this.state.list.length === 0 ? <div className='end-label'>みつかりませんでした</div> : <div className='end-label'>No More Data</div>
      // return this.state.list.list.map((each, i) => {
      return scoreStore.list.map((each, i) => {
        if (!this.state.load) return
        if (!each.status) return
        const composer = each.composer.length === 0 ? '' : lib.makeLine(each.composer)
        const arranger = each.arranger.length === 0 ? '' : lib.makeLine(each.arranger)
        const bar = composer === '' || arranger === '' ? '' : <span className='bar'>/</span>
        const boxInfo = this.state.boxMode ? <div className='locate'><span className='box-label'>{each.boxLabel}</span>&ndash;<span className='score-number'>{each.label}</span></div> : ''
        return (
          <div key={each._id} className='score-list' onTouchStart={() => {}} onClick={(e) => {this.openDetail(e, each)}}>
            <div className='content'>
              {boxInfo}
              <div className='title-ja'><span>{each.titleJa}</span></div>
              <div className='title-en'><span>{each.titleEn}</span></div>
              <div className='composer-arranger'><span><span>{composer}</span>{bar}<span>{arranger}</span></span></div>
            </div>
          </div>
        )
      })
    } else {
      return (<div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>)
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    const searchLoading = this.state.searchLoad ? <i className='fas fa-search'></i> : <i className='fas fa-spinner fa-pulse'></i>
    const searchBarButtonClass = this.state.queryText ? 'search-bar-button' : 'search-bar-button hidden'
    const list = this.renderList()
    const endLabel = this.state.load ? scoreStore.list.length === 0 ? 'みつかりませんでした' : 'これ以上データはありません' : ''
    const detailContent = this.detailContent()
    return (
      <div className='home'>
        {/* <div className='wrap'> */}
          <div className='search-bar'>
            <div className='search-frame'>
              <div className='search-box'>
                <div className='search-bar-icon'>{searchLoading}</div>
                <input type='text' value={this.state.queryText} onChange={(e) => this.search(e)} onKeyPress={(e) => this.keyPress(e)}  ref={(i) => {this.searchBox = i}} placeholder='検索' />
                <div onClick={() => this.resetSearch()} className={searchBarButtonClass}><i className='fas fa-times-circle'></i></div>
              </div>
            </div>
          </div>
          <div className='list'>
            {list}
            <div className='end-label'>{endLabel}</div>
          </div>
          <DetailModal
            isOpen={this.state.detailOpen}
            onRequestClose={this.closeDetail}
            contentLabel='detail'
            className='modal-detail'
            overlayClassName='modal-overlay'
            ariaHideApp={false}
          >
          <div>
            <div className='modal-header'>
              <div>詳細</div>
              <div><button onClick={(e) => this.closeDetail(e)} className='close'>&times;</button></div>
            </div>
            {detailContent}
          </div>
          </DetailModal>
        {/* </div> */}
      </div>
    )
  }
}