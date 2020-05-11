import React, { Component } from 'react'
import request from 'superagent'

import './TextModify.css'

export default class TextModify extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: this.props.text,
      load: undefined
    }
  }

  sendText (e) {
    e.preventDefault()
    if (!this.state.text) return
    if (!this.props.api) return
    this.setState({load: false})
    request.post(this.props.api)
      .type('form')
      .send({
        userid: window.localStorage.user,
        token: window.localStorage.token,
        text: this.state.text
      })
      .end((err, res) => {
        if (err) return
        if (res.body.status) {
          this.setState({
            load: true
          })
          if (this.props.onChange) {
            this.props.onChange()
          }
        }
      })
  }

  keyPress (e) {
    if (e.which === 13) this.sendText(e)
  }

  cancel (e) {
    e.preventDefault()
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }

  loading () {
    if (!this.state.load) return <div className='loading' key={0}><div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div></div>
  }

  render () {
    const loading = this.loading()
    const disabled = (this.state.text === this.props.text || !this.state.text) ? true : false;
    return (
      <div className='setting-text'>
        <label>{this.props.title}</label>
        <div className='form'>
          <input value={this.state.text} onChange={(e) => this.setState({text: e.target.value})} placeholder={this.props.text} onKeyPress={(e) => this.keyPress(e)} />
          <div>
            <button onClick={(e) => this.sendText(e)} className='save' disabled={disabled}>保存</button>
            <button onClick={(e) => this.cancel(e)} className='cancel'>キャンセル</button>
          </div>
        </div>
      </div>
    )
  }
}