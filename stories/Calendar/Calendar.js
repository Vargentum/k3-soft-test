'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import dateUtil from 'date-format-utils'
import {toArray} from 'lodash'
import './Calendar.styl'

export default class Calendar extends Component {
  static propTypes = {
    data: PT.object,
    onDateSet: PT.func,
    hourScaleGap: PT.number,
    hourLabelFormat: PT.string,
    bemBlockName: PT.string
  }
  static defaultProps = {
    onDateSet: R.identity,
    hourScaleGap: 3,
    hourLabelFormat: 'HH:mm',
    bemBlockName: 'Calendar'
  }
  constructor(props) {
    super(props);
    this.rDayHours = this.rDayHours.bind(this)
    this.rDay = this.rDay.bind(this)
    this.rCaptionHours = this.rCaptionHours.bind(this)
  }
  toReadableHourLabel(hour) {
    const {hourLabelFormat} = this.props
    const label = new Date()
    label.setHours(hour)
    label.setMinutes(0)
    return dateUtil.formatDate(label, hourLabelFormat)
  }
  rDayHours(h) {
    const {bemBlockName} = this.props
    return <td className={`${bemBlockName}__cell ${bemBlockName}__dayHour`} key={h} />
  }
  rDay(day ,label) {
    const {hourScaleGap, bemBlockName} = this.props
    const dayHours = R.times(this.rDayHours, hourScaleGap)
    const row = {
      label: <td 
        className={`${bemBlockName}__cell ${bemBlockName}__dayLabel`} 
        colSpan={hourScaleGap}
        >{label}</td>,

      allDay: <td 
        className={`${bemBlockName}__cell ${bemBlockName}__daySelectAll`}
        colSpan={hourScaleGap}
      />,
      
      hours: R.map(this.rDayHours, Calendar.HOURS)
    }
    return <tr key={label}>
      {row.label}
      {row.allDay}
      {row.hours}
    </tr>
  }
  rCaptionHours(hour) {
    const {bemBlockName, hourScaleGap} = this.props
    const readableHourLabel = this.toReadableHourLabel(hour)
    console.log(readableHourLabel, `readableHourLabel---------`)
    return <td 
      colSpan={hourScaleGap}
      className={`${bemBlockName}__caption ${bemBlockName}__captionDayHour`} 
      key={readableHourLabel}
      >{readableHourLabel}</td>
  }
  rCaption() {
    const {hourScaleGap, bemBlockName} = this.props
    const caption = {
      label: <th 
        colSpan={hourScaleGap} 
        className={`${bemBlockName}__caption`} />,

      allDay: <th 
        colSpan={hourScaleGap} 
        className={`${bemBlockName}__caption ${bemBlockName}__captionAllDay`}
        >All Day</th>,

      hours: R.pipe(
        R.filter(h => !(h % hourScaleGap)),
        R.map(this.rCaptionHours)
      )(Calendar.HOURS)
    }
    return <tr>
      {caption.label}
      {caption.allDay}
      {caption.hours}
    </tr>
  }
  render () {
    const {data, bemBlockName} = this.props
    const bodyRows = R.pipe(R.mapObjIndexed(this.rDay), toArray)(data)
    const headRow = this.rCaption()
    return (
      <table className={`${bemBlockName}`}>
        <thead>
          {headRow}
        </thead>
        <tbody>
          {bodyRows}
        </tbody>
      </table>
    )
  }
}
Calendar.HOURS = R.range(0, 24)



