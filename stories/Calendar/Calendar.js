'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import {connect} from 'react-redux'

export class Calendar extends Component {
  static propTypes = {}
  static defaultProps = {}

  render() {
    const {} = this.props

    return (
      <div>Hello Calendar</div>
    )
  }
}

export default R.pipe(
  connect(
    (state) => ({}),
    {}
  ),
)(Calendar)
