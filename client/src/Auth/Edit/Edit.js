import React, { Component } from 'react'
import { Link, Route, Switch, Redirect } from 'react-router-dom'
import request from 'superagent'
import { confirmAlert } from 'react-confirm-alert'

import { Actions } from '../../Component/Flux/Actions'

import Input from '../Component/Input/Input'

import './Edit.css'

export default class Edit extends Component {
  constructor (props) {
    super(props)
    const { params } = this.props.match
    const id = params.id ? params.id : false
    const mode = params.id ? 'edit' : 'new'
    if (!id) {
      Actions.updateTitle('新しい楽譜を追加')
    } else {
      Actions.updateTitle('楽譜情報の修正')
      Actions.backNavigation(true, '/score/detail/' + id)
    }
    this.state = {
      load: undefined,
      id,
      mode,
      redirect: undefined,
      boxList: [],
      data: {
        // 楽譜番号(初期値)
        number: 1,
        // タイトル(日本語)
        titleJa: '',
        // タイトル(英語)
        titleEn: '',
        // 作曲者
        composer: [''],
        // 編曲者
        arranger: [''],
        // 出版社
        publisher: '',
        // ジャンル
        genre: '',
        // 譜面の種類(0: 原譜, 1: コピー譜)
        scoreType: '0',
        // コピー元
        copyMemo: '',
        // 楽譜の状態(0: 保管中, 1: 使用中, 2: 貸出中)
        scoreStatus: '0',
        // 欠譜の状態(0: なし, 1: あり, 2: 未確認)
        scoreLack: '0',
        // 欠譜
        lackList: [''],
        // 貸出先
        lendLocate: '',
        // 原譜化の状態(0: 原譜化済[stable])
        scoreBased: '0',
        // 楽譜管理番号
        label: '000001',
        // 楽譜保管先
        boxLabel: '',
      },
      deleteCheckbox: false
    }
  }

  componentWillMount () {
    this.loadStatus()
  }

  loadStatus () {
    this.setState({load: false})
    request
      .post('/api/edit/pre')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id: this.state.id,
        mode: this.state.mode
      })
      .end((err, res) => {
        if (err || !res.body.status) return
        if (res.body.status) {
          // 箱が未作成のときはBoxManagementComponentへ
          if (res.body.boxList.length === 0) return this.redirectBoxManagement()
          var boxList = []
          for (var i=0;i<res.body.boxList.length;i++) {
            var each = res.body.boxList[i]
            if (each.status) boxList.push(each)
          }
          // 使用可能な箱がない
          if (boxList.length === 0) return this.redirectBoxManagement()
          if (this.state.mode === 'new') {
            // 新規作成
            var select = boxList[boxList.length - 1]
            var data = this.state.data
            data['boxLabel'] = select.label
            // 楽譜番号と楽譜管理番号
            if (!res.body.latest) {
              // 楽譜登録なし
              return this.setState({load: true, boxList: boxList, data})
            }
            data['number'] = parseInt(res.body.latest.number) + 1
            data['label'] = ('000000' + data.number).slice(-6)
            this.setState({load: true, boxList: boxList, data})
          } else {
            // 編集
            this.setState({load: true, boxList: boxList, data: res.body.data})
          }
        }
      })
  }

  reloadNumberLabel () {
    if (this.state.mode !== 'new') return
    request
      .post('/api/edit/pre')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id: this.state.id,
        mode: this.state.mode
      })
      .end((err, res) => {
        if (err || !res.body.status) return
        if (res.body.status) {
          var data = this.state.data
          data['number'] = parseInt(res.body.latest.number) + 1
          data['label'] = ('000000' + data.number).slice(-6)
          this.setState({load: true, data})
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
        mode: this.state.mode,
        data: this.state.data
      })
      .end((err, res) => {
        if (err) return Actions.toastShow('ネットワーク接続を確認してください')
        const response = res.body
        if (response.status) {
          Actions.loadList()
          if (this.state.mode === 'new') {
            // this.setState({redirect: '/score/add', load: true})
            this.setState({
              data: {
                // 楽譜番号(初期値)
                // number: 1,
                // タイトル(日本語)
                titleJa: '',
                // タイトル(英語)
                titleEn: '',
                // 作曲者
                composer: [''],
                // 編曲者
                arranger: [''],
                // 出版社
                publisher: '',
                // ジャンル
                genre: '',
                // 譜面の種類(0: 原譜, 1: コピー譜)
                scoreType: '0',
                // コピー元
                copyMemo: '',
                // 楽譜の状態(0: 保管中, 1: 使用中, 2: 貸出中)
                scoreStatus: '0',
                // 欠譜の状態(0: なし, 1: あり)
                scoreLack: '0',
                // 欠譜
                lackList: [''],
                // 貸出先
                lendLocate: '',
                // 原譜化の状態(0: 原譜化済[stable])
                scoreBased: '0',
                // 楽譜管理番号
                // label: '000001',
                // 楽譜保管先
                boxLabel: '',
              }
            })
            this.loadStatus()
            return Actions.toastShow('新しい楽譜を登録しました')
          } else {
            this.setState({redirect: '/score/detail/' + this.state.id, load: true})
            return Actions.toastShow('楽譜情報を修正しました')
          }
        } else {
          this.setState({load: true})
          return Actions.toastShow('エラーが発生しました')
        }
      })
  }

  deleteData () {
    request.post('/api/delete')
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        id: this.state.id
      })
      .end((err, res) => {
        if (err) return // Actions.toastShow('ネットワーク接続を確認してください')
        const response = res.body
        if (response.status) {
          Actions.loadList()
          this.setState({redirect: '/'})
          return // Actions.toastShow('楽譜情報を削除しました')
        } else {
          return // Actions.toastShow('エラーが発生しました')
        }
      })
  }

  deleteRequest (e) {
    e.preventDefault()
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>この楽譜情報を削除しますか？</h1>
            <p>この操作は取り消せません</p>
            <div className='button-group'>
              <button onClick={onClose}>キャンセル</button>
              <button onClick={() => {
                this.deleteData()
                onClose()
              }}>削除</button>
            </div>
          </div>
        )
      }
    })
  }

  redirectBoxManagement () {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='alert'>
            <h1>箱の管理へ移動します</h1>
            <p>使用可能な箱がないため楽譜情報を追加できません</p>
            <div className='button-group'>
              <button onClick={() => {
                this.setState({redirect: '/score'})
                onClose()
              }}>キャンセル</button>
              <button onClick={() => {
                this.setState({redirect: '/score/box'})
                onClose()
              }}>OK</button>
            </div>
          </div>
        )
      }
    })
  }

  changeValue (e) {
    var data = this.state.data
    data[e.target.props.target] = e.value
    this.setState({data})
  }

  changeValueArray (num, e) {
    var data = this.state.data
    var target = data[e.target.props.target]
    target[num] = e.value
    data[e.target.props.target] = target
    this.setState({data})
  }

  addBlank (prop) {
    var data = this.state.data
    var target = data[prop]
    target[target.length] = ''
    data[prop] = target
    this.setState({data})
  }

  selectChange (target, e) {
    var data = this.state.data
    data[target] = e.target.value
    this.setState({data})
  }

  renderScoreType () {
    if (this.state.load) {
      return (
        <div className='radio-input'>
          <input type='radio' name='scoreType' id='scoreTypeTrue' value={1} checked={this.state.data.scoreType === '1'} onChange={(e) => this.selectChange('scoreType', e)} /><label htmlFor='scoreTypeTrue'><span>コピー譜</span></label>
          <input type='radio' name='scoreType' id='scoreTypeFalse' value={0} checked={this.state.data.scoreType === '0'} onChange={(e) => this.selectChange('scoreType', e)} /><label htmlFor='scoreTypeFalse'><span>原譜</span></label>
        </div>
      )
    }
  }

  renderCopiedFromInput () {
    if (this.state.load && this.state.data.scoreType === '1') {
      return (<Input label='コピーメモ' value={this.state.data.copyMemo} target='copyMemo' inputClass='copied-from' onChange={(e) => this.changeValue(e)} />)
    }
  }

  renderScoreBased () {
    if (this.state.load) {
      return (
        <div className='radio-input'>
          <input type='radio' name='scoreBased' id='scoreBasedTrue' value={1} checked={this.state.data.scoreBased === '1'} onChange={(e) => this.selectChange('scoreBased', e)} /><label htmlFor='scoreBasedTrue'><span>未処理</span></label>
          <input type='radio' name='scoreBased' id='scoreBasedFalse' value={0} checked={this.state.data.scoreBased === '0'} onChange={(e) => this.selectChange('scoreBased', e)} /><label htmlFor='scoreBasedFalse'><span>処理済</span></label>
        </div>
      )
    }
  }

  renderScoreLack () {
    if (this.state.load) {
      return (
        <div className='radio-input'>
          <input type='radio' name='scoreLack' id='scoreLackTrue' value={1} checked={this.state.data.scoreLack === '1'} onChange={(e) => this.selectChange('scoreLack', e)} /><label htmlFor='scoreLackTrue'><span>あり</span></label>
          <input type='radio' name='scoreLack' id='scoreLackUnconfirmed' value={2} checked={this.state.data.scoreLack === '2'} onChange={(e) => this.selectChange('scoreLack', e)} /><label htmlFor='scoreLackUnconfirmed'><span>未確認</span></label>
          <input type='radio' name='scoreLack' id='scoreLackFalse' value={0} checked={this.state.data.scoreLack === '0'} onChange={(e) => this.selectChange('scoreLack', e)} /><label htmlFor='scoreLackFalse'><span>なし</span></label>
        </div>
      )
    }
  }

  renderScoreLackInput () {
    if (this.state.load && this.state.data.scoreLack === '1') {
      const list =  this.state.data.lackList.map((each, i) => {
        return <Input key={i} label={'欠譜' + (i + 1)} value={each} target='lackList' className='multi' inputClass='lack-list' onChange={(e) => this.changeValueArray(i, e)} />
      })
      return (
        <div>
          {list}
          <div className='add-data' onClick={() => this.addBlank('lackList')}><i className="fas fa-plus-circle"></i>欠譜情報を追加</div>
        </div>
      )
    }
  }

  renderBoxSelect () {
    if (this.state.load) {
      const options = this.state.boxList.map((each, i) => {
        return <option key={each._id} value={each.label}>{each.label} - {!each.locate ? '未設定' : each.locate}</option>
      })
      return (
        <div>
          <select value={this.state.data.boxLabel} onChange={(e) => this.selectChange('boxLabel', e)}>
            {options}
          </select>
        </div>
      )
    }
  }

  renderScoreStatus () {
    if (this.state.load) {
      return (
        <div className='radio-input'>
          <input type='radio' name='scoreStatus' id='scoreStatusLend' value={2} checked={this.state.data.scoreStatus === '2'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusLend' className='highlight-high'><span>貸出中</span></label>
          <input type='radio' name='scoreStatus' id='scoreStatusUsing' value={1} checked={this.state.data.scoreStatus === '1'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusUsing' className='highlight-low'><span>使用中</span></label>
          <input type='radio' name='scoreStatus' id='scoreStatusStrage' value={0} checked={this.state.data.scoreStatus === '0'} onChange={(e) => this.selectChange('scoreStatus', e)} /><label htmlFor='scoreStatusStrage'><span>保管</span></label>
        </div>
      )
    }
  }

  renderLendInput () {
    if (this.state.load && this.state.data.scoreStatus === '2') {
      return (<Input label='貸出先' value={this.state.data.lendLocate} target='lendLocate' className='lend' onChange={(e) => this.changeValue(e)} />)
    }
  }

  renderPreSentence () {
    if (this.state.load) {
      if (this.state.mode === 'new') {
        return (
          <div className='pre'>
            <p>新しい楽譜を追加します。</p>
            <p>各項目は入力規則に準じることを推奨します。</p>
          </div>
        )
      } else {
        return (
          <div className='pre'>
            <p>楽譜情報を編集します。</p>
            <p>各項目は入力規則に準じることを推奨します。</p>
          </div>
        )
      }
    }
  }

  renderDeleteForm () {
    if (this.state.load) {
      if (this.state.mode !== 'new') {
        const disabled = this.state.deleteCheckbox ? false : true;
        return (
          <div className='button'>
            <p>削除する場合はチェックボックスをONにしてからボタンを押します</p>
            <input type='checkbox' value={this.state.deleteCheckbox} id='delete' onChange={() => this.setState({deleteCheckbox: !this.state.deleteCheckbox})} /><label htmlFor='delete'>削除する</label>
            <button onClick={(e) => this.deleteRequest(e)} disabled={disabled}><i className="fas fa-trash"></i>削除する</button>
          </div>
        )
      }
    }
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect} />
    if (!this.state.load) {
      return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
    }
    const data = this.state.data
    const composerInput = data.composer.map((each, i) => {
      return (
        <Input key={i} label={'作曲者' + (i + 1)} value={each} target='composer' className='multi' inputClass='composer' onChange={(e) => this.changeValueArray(i, e)} />
      )
    })
    const arrangerInput = data.arranger.map((each, i) => {
      return (
        <Input key={i} label={'編曲者' + (i + 1)} value={each} target='arranger' className='multi' inputClass='arranger' onChange={(e) => this.changeValueArray(i, e)} />
      )
    })
    const preSentence = this.renderPreSentence()
    const scoreTypeSelect = this.renderScoreType()
    const copyMemoInput = this.renderCopiedFromInput()
    const scoreLackSelect = this.renderScoreLack()
    const scoreLackInputs = this.renderScoreLackInput()
    const scoreBasedSelect = this.renderScoreBased()
    const boxSelect = this.renderBoxSelect()
    const scoreStatusSelect = this.renderScoreStatus()
    const lendInput = this.renderLendInput()
    const deleteButton = this.renderDeleteForm()
    return (
      <div className='edit'>
        {preSentence}
        <div className='information'>
          <h2>基本情報</h2>
          <div className='list'>
            <Input label='タイトル(日本語)' value={data.titleJa} target='titleJa' inputClass='title-ja' onChange={(e) => this.changeValue(e)} />
            <Input label='タイトル(英語)' value={data.titleEn} target='titleEn' inputClass='title-en' onChange={(e) => this.changeValue(e)} />
            {composerInput}
            <div className='add-data' onClick={() => this.addBlank('composer')}><i className="fas fa-plus-circle"></i>作曲者を追加</div>
            {arrangerInput}
            <div className='add-data' onClick={() => this.addBlank('arranger')}><i className="fas fa-plus-circle"></i>編曲者を追加</div>
            <Input label='出版社' value={data.publisher} target='publisher' inputClass='publisher' onChange={(e) => this.changeValue(e)} />
            <Input label='ジャンル' value={data.genre} target='genre' inputClass='genre' onChange={(e) => this.changeValue(e)} />
          </div>
        </div>
        <div className='information'>
          <h2>楽譜の状態</h2>
          <div className='list'>
            <div className='input'>
              <label>種類</label>
              {scoreTypeSelect}
            </div>
            {copyMemoInput}
            <div className='input'>
              <label>欠譜</label>
              {scoreLackSelect}
            </div>
            {scoreLackInputs}
            <div className='input'>
              <label>原譜処理</label>
              {scoreBasedSelect}
            </div>
          </div>
        </div>
        <div className='information'>
          <h2>保管情報</h2>
          <div className='list'>
            <div className='input'>
              <label>保管状況</label>
              {scoreStatusSelect}
            </div>
            {lendInput}
            <div className='input' onClick={() => this.reloadNumberLabel()}>
              <label>楽譜管理番号</label>
              <span className='score-number'>{data.label}</span>
            </div>
            <div className='input'>
              <label>楽譜保管箱</label>
              {boxSelect}
            </div>
          </div>
        </div>
        <div className='button'>
          <button onClick={(e) => this.sendData(e)}><i className="far fa-edit"></i>{this.state.mode === 'new' ? '登録' : '修正'}</button>
        </div>
        {deleteButton}
      </div>
    )
  }
}