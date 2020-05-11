import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

import Base from './Base/Base'
import Auth from './Auth/Auth'

export default class App extends Component {
  render () {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={Base} />
          <Route path='/reg' component={Base} />
          <Route path='/score' component={Auth} />
          {/* <Route path='/score' component={Auth} /> */}
        </Switch>
      </Router>
    )
  }
}