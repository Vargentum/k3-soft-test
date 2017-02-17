'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import dateUtil from 'date-format-utils'
import {toArray} from 'lodash'
import './Calendar.styl'
import {connect} from 'react-redux'
import {initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection} from './calendar-reducer'
import cls from 'classnames'

export class Calendar extends Component {
  static propTypes = {
    selectionData: PT.object,
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
    this.rDay = this.rDay.bind(this)
    this.rCaptionHours = this.rCaptionHours.bind(this)
  }
  componentWillMount () {
    const {initCalendarSelection, selectionData} = this.props
    initCalendarSelection(selectionData)
  }
  componentWillUnmount () {
    const {clearCalendarSelection} = this.props
    clearCalendarSelection()
  }
  toReadableHourLabel(hour) {
    const {hourLabelFormat} = this.props
    const label = new Date()
    label.setHours(hour)
    label.setMinutes(0)
    return dateUtil.formatDate(label, hourLabelFormat)
  }
  rDayHours ({selectedMinutes, dayKey}) {
    const {bemBlockName, toggleHourSelection} = this.props
    return (hour) => {
      const cellMinutes = hour * Calendar.MINUTES_IN_HOUR
      const isSelected = R.find(Calendar.compareWithSelection(cellMinutes), selectedMinutes)
      return <td
        className={cls(`${bemBlockName}__cell ${bemBlockName}__dayHour`, {
          isSelected
        })}
        onClick={R.partial(toggleHourSelection, [{dayKey, selectedMinutes, isSelected: !isSelected}])}
        key={hour} />
    }
  }
  rDay(selectedMinutes, dayKey) {
    const {hourScaleGap, bemBlockName} = this.props
    console.log(selectedMinutes, `selectedMinutes---------`)
    const row = {
      label: <td
        className={`${bemBlockName}__cell ${bemBlockName}__dayKey`}
        colSpan={hourScaleGap}
        >{dayKey}</td>,

      allDay: <td
        className={`${bemBlockName}__cell ${bemBlockName}__daySelectAll`}
        colSpan={hourScaleGap}
      />,

      hours: R.map(this.rDayHours({selectedMinutes, dayKey}), Calendar.HOURS)
    }
    return <tr key={dayKey}>
      {row.label}
      {row.allDay}
      {row.hours}
    </tr>
  }
  rCaptionHours(hour) {
    const {bemBlockName, hourScaleGap} = this.props
    const readableHourLabel = this.toReadableHourLabel(hour)
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
        R.filter(hour => !(hour % hourScaleGap)),
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
    const {selectionData, bemBlockName} = this.props
    const bodyRows = R.pipe(R.mapObjIndexed(this.rDay), toArray)(selectionData)
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
Calendar.MINUTES_IN_HOUR = 60
Calendar.compareWithSelection = (val) => ({et, bt}) => val >= bt && val < et

export default R.pipe(
  connect(
    (state) => ({}),
    {initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection}
  ),
)(Calendar)
