import React, { Component } from 'react'
import { Link, Route, Switch } from 'react-router-dom'

import SettingList from './SettingList/SettingList'
import SettingUserName from './SettingUserName/SettingUserName'
import SettingMail from './SettingMail/SettingMail'
import SettingPassword from './SettingPassword/SettingPassword'
import SettingUserDelete from './SettingUserDelete/SettingUserDelete'
import SettingLicense from './SettingLicense/SettingLicense'
import SettingAdmin from './SettingAdmin/SettingAdmin'

import './Setting.css'

export default class Setting extends Component {
  render () {
    return (
      <div className='setting'>
        <Switch>
          <Route exact path='/score/setting' component={SettingList} />
          <Route path='/score/setting/name' component={SettingUserName} />
          <Route path='/score/setting/email' component={SettingMail} />
          <Route path='/score/setting/password' component={SettingPassword} />
          <Route path='/score/setting/delete' component={SettingUserDelete} />
          <Route path='/score/setting/license' component={SettingLicense} />
          <Route path='/score/setting/admin' component={SettingAdmin} />
        </Switch>
      </div>
    )
  }
}