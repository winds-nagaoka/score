import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'

import { Actions } from '../../Component/Flux/Actions'
import { scoreStore, userStore } from '../../Component/Flux/Stores'
import Input from '../Component/Input/Input'

import lib from '../../Component/Library/Library'

import './Detail.css'

export default class Detail extends Component {
  constructor (props) {
    super(props)
    const { params } = this.props.match
    const id = params.id ? params.id : ''
    this.state = {
      load: undefined,
      id,
      redirect: undefined,
      boxList: [],
      data: {},
      hold: {},
      box: {},

      user: {},
      userLoad: undefined
    }
    scoreStore.onLoad = () => {}
    userStore.onLoad = () => {
      this.setState({user: userStore.user, userLoad: true})
    }
  }

  componentWillMount () {
    Actions.updateTitle('詳細')
    Actions.backNavigation(true, '/score')
    userStore.user === undefined ? Actions.loadUser() : this.setState({user: userStore.user, userLoad: true})
    this.setState({load: false})
    this.loadData()
  }

  loadData () {
    request.post('/api/detail')
    .type('form')
    .send({
      userid: window.localStorage.user,
      token: window.localStorage.token,
      id: this.state.id
    })
    .end((err, res) => {
      if (err) return
      // const response = res.body
      if (res.body.status) {
        var boxList = []
        for (var i=0;i<res.body.boxList.length;i++) {
          var each = res.body.boxList[i]
          if (each.status) boxList.push(each)
          if (res.body.data.boxLabel === each.label) var box = each
        }
        // 比較用オブジェクト
        const hold = JSON.parse(JSON.stringify(res.body.data))
        this.setState({data: res.body.data, hold, boxList, box, load: true})
      }
    })
  }

  sendData (e) {
    e.preventDefault()
    this.setState({load: false})
    request.post('/api/edit')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id: this.state.id,
        mode: 'edit',
        data: this.state.data
      })
      .end((err, res) => {
        if (err) return // Actions.toastShow('ネットワーク接続を確認してください')
        const response = res.body
        if (response.status) {
          Actions.loadList()
          this.loadData()
          this.setState({load: true})
          return Actions.toastShow('楽譜情報を修正しました')
        } else {
          return Actions.toastShow('エラーが発生しました')
        }
      })
  }

  changeValue (e) {
    var data = this.state.data
    data[e.target.props.target] = e.value
    this.setState({data: data})
  }

  selectChange (target, e) {
    var data = this.state.data
    data[target] = e.target.value
    this.setState({data: data})
  }

  renderBoxSelect () {
    if (this.state.load && lib.getUserAdmin(this.state.user)) {
      const options = this.state.boxList.map((each, i) => {
        return <option key={each._id} value={each.label}>{each.label} - {!each.locate ? '未設定' : each.locate}</option>
      })
      return (
        <div className='input'>
          <label>楽譜保管箱</label>
          <div>
            <select value={this.state.data.boxLabel} onChange={(e) => this.selectChange('boxLabel', e)}>
              {options}
            </select>
          </div>
        </div>

      )
    }
  }

  renderScoreStatus () {
    if (this.state.load) {
      if (lib.getUserAdmin(this.state.user)) {
        return (
          <div className='radio-input'>
            <input type='radio' name='scoreStatus' id='scoreStatusLend' value={2} checked={this.state.data.scoreStatus === '2'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusLend' className='highlight-high'><span>貸出中</span></label>
            <input type='radio' name='scoreStatus' id='scoreStatusUsing' value={1} checked={this.state.data.scoreStatus === '1'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusUsing' className='highlight-low'><span>使用中</span></label>
            <input type='radio' name='scoreStatus' id='scoreStatusStrage' value={0} checked={this.state.data.scoreStatus === '0'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusStrage'><span>保管</span></label>
          </div>
        )  
      } else {
        if (this.state.data.scoreStatus === '0') {
          return <div className='radio-display'><label>保管</label></div>
        } else if (this.state.data.scoreStatus === '1') {
          return <div className='radio-display'><label className='highlight-low'>使用中</label></div>
        } else { // this.state.data.scoreStatus === '2'
          return <div className='radio-display'><label className='highlight-high'>貸出中</label></div>        
        }
      }
    }
  }

  renderLendInput () {
    if (this.state.load && this.state.data.scoreStatus === '2' && lib.getUserAdmin(this.state.user)) {
      return (<Input label='貸出先' value={this.state.data.lendLocate} target='lendLocate' className='lend' onChange={(e) => this.changeValue(e)} />)
    }
  }

  renderScoreType () {
    if (this.state.load) {
      const scoreType = this.state.data.scoreType === '1' ? 'コピー譜' : '原譜'
      return (
        <div className='display'>
          <label>譜種</label>
          <span className='score-type'>{scoreType}</span>
        </div>
      )
    }
  }

  renderScoreLack () {
    if (this.state.load) {
      if (this.state.data.scoreLack) {
        if (this.state.data.scoreLack === '1') {
          var scoreLack = 'あり'
        } else if (this.state.data.scoreLack === '2') {
          var scoreLack = '未確認'
        } else {
          var scoreLack = 'なし'
        }
        // console.log(this.state.data, 'score', scoreLack,this.state.data.scoreLack)
        return (
          <div className='display'>
            <label>欠譜</label>
            <span className='score-lack'>{scoreLack}</span>
          </div>
        )
      }
    }
  }

  renderScoreLackList () {
    if (this.state.load) {
      if (this.state.data.scoreLack === '1') {
        if (this.state.data.lackList.length > 0) {
          if (this.state.data.lackList[0] === '') {
            var list = <span className='no-data'>No Data</span>
          } else {
            var list = this.state.data.lackList.map((each, i) => {
              return (<span className='score-lack-list'>{each}</span>)
            })
          }
        }
        return (
          <div className='display'>
            <label>欠譜リスト</label>
            {list}
          </div>
        )
      }
    }
  }

  renderScoreBased () {
    if (this.state.load) {
      const scoreBased = this.state.data.scoreBased === '1' ? '未処理' : '処理済'
      return (
        <div className='display'>
          <label>原譜処理</label>
          <span className='score-based'>{scoreBased}</span>
        </div>
      )
    }
  }

  render () {
    lib.objectDiff(this.state.data, this.state.hold)
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) {
      return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    }
    const data = this.state.data
    const box = this.state.box
    const hold = this.state.hold

    const boxSelect = this.renderBoxSelect()
    const scoreStatusSelect = this.renderScoreStatus()
    const lendInput = this.renderLendInput()
    const sendButton = lib.objectDiff(this.state.data, this.state.hold) ? <div className='button'><button onClick={(e) => this.sendData(e)} className='suggest'>登録</button></div> : <div></div>

    const titleJa = data.titleJa ? <span className='title-ja'>{data.titleJa}</span> : <span className='no-data'>No Data</span>
    const titleEn = data.titleEn ? <span className='title-en'>{data.titleEn}</span> : <span className='no-data'>No Data</span>
    const composer = data.composer.length === 0 || lib.makeLine(data.composer) === '' ? <span className='no-data'>No Data</span> : <span>{lib.makeLine(data.composer)}</span>
    const arranger = data.arranger.length === 0 || lib.makeLine(data.arranger) === '' ? <span className='no-data'>No Data</span> : <span>{lib.makeLine(data.arranger)}</span>

    const scoreType = this.renderScoreType()
    const scoreLack = this.renderScoreLack()
    const scoreLackList = this.renderScoreLackList()
    const scoreBased = this.renderScoreBased()

    const status = lib.getUserAdmin(this.state.user)

    return (
      <div className='detail'>
        {/* <div className='pre'>
          {status ? '保管場所の確認のほか、箱の移動ができます。' : 'ご入用の際は下記楽譜管理番号を楽譜係までお知らせください。'}
        </div> */}
        <div className='information'>
          <h2>楽譜の状態</h2>
          <div className='list'>
            <div className='display'>
              <div className='locate'>
                {lib.getUserAdmin(this.state.user) ? <div className='box'><span className='label'>楽譜保管箱</span><span className='box-label'>{box.label}</span><span className='box-locate'>{box.locate ? box.locate : '未設定'}</span></div> : ''}
                <div className='score'>
                  <span className='label'>楽譜管理番号</span><span className='score-number'>{data.label}</span><span className='label'>&nbsp;</span>
                </div>
              </div>
            </div>
            <div className='input'>
              <label>保管状況</label>
              {scoreStatusSelect}
            </div>
            {lendInput}
            {boxSelect}
          </div>
        </div>
        {sendButton}
        <div className='information'>
          <h2>楽譜情報</h2>
          <div className='list'>
            <div className='display'>
              <label>タイトル(日本語)</label>
              {titleJa}
            </div>
            <div className='display'>
              <label>タイトル(英語)</label>
              {titleEn}
            </div>
            <div className='display'>
              <label>作曲者</label>
              {composer}
            </div>
            <div className='display'>
              <label>編曲者</label>
              {arranger}
            </div>
            <div className='display'>
              <label>出版社</label>
              <span className='publisher'>{data.publisher}</span>
            </div>
            <div className='display'>
              <label>ジャンル</label>
              <span className='publisher'>{data.genre}</span>
            </div>
            {scoreType}
            {scoreLack}
            {scoreLackList}
            {scoreBased}
          </div>
        </div>
        {status ? <div className='links'><Link to={'/score/edit/' + this.state.id}><i className="far fa-edit"></i>情報を修正</Link></div> : <div className='pre'><p>楽譜についての詳細な状態はタイトルまたは楽譜管理番号をあわせて楽譜係までお問い合わせください</p></div>}
      </div>
    )
  }
}