import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

import { Actions } from '../../../Component/Flux/Actions'
import lib from '../../../Component/Library/Library'

import Logo from '../../../Component/Logo/hr.svg'

import './SettingLicense.css'

export default class SettingLicense extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentWillMount () {
    Actions.updateTitle('ライセンス情報')
    Actions.backNavigation(true, '/score/setting')
  }

  render () {
    return (
      <div className='setting-license'>
        <div className='app-version'>
          <div><Logo /></div>
          <div>
            <div><span>ウィンズスコア</span></div>
            <div><span><span>version</span><span>{lib.getVersion()}</span></span></div>
          </div>
        </div>
        <div className='pre'>
          <p>Made for The Wind Ensemble score management.</p>
          <p>This software is made possible with the following open sources.</p>
          <p>Thank the open source community for all of their contributions.</p>
        </div>
        <div className='version'>
          <h2>Application Dependencies</h2>
          <p><i className="fab fa-react"></i>Powered by React</p>
          <p><span className='react'>React</span><span>version</span><span>16.4.0</span></p>
          <p><span className='react-router'>React Router</span><span>version</span><span>4.2.2</span></p>
          <p><span className='nodejs'>SuperAgent</span><span>version</span><span>3.8.2</span></p>
          <p><span className='flux'>Flux</span><span>version</span><span>3.1.3</span></p>
          <h2>Server Dependencies</h2>
          <p><i className="fab fa-node-js"></i>Powered by Node.js</p>
          <p><span className='express'>Express</span><span>version</span><span>4.16.2</span></p>
          <p><span className='nodejs'>NeDB</span><span>version</span><span>1.8.0</span></p>
        </div>
        <div className='footer'>
          <span>&copy; </span><span className='name'>{lib.getYear()} Winds, Ryo Kato</span>
        </div>
      </div>
    )
  }
}