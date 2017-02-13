'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import { connect } from 'react-redux'

export class Calendar extends Component {
  static propTypes = {
    children: PT.element
  }
  static defaultProps = {}

  render () {
    const { children } = this.props

    return (
      <div>
        Hello
        {children}
      </div>
    )
  }
}

export default R.pipe(
  connect(
    (state) => ({}),
    {}
  ),
)(Calendar)
