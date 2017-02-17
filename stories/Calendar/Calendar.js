'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import dateUtil from 'date-format-utils'
import {toArray} from 'lodash'
import './Calendar.styl'
import {connect} from 'react-redux'
import {
  DAY_KEYS, DAY_HOURS_LIST, MINUTES_IN_HOUR, 
  initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection
} from './calendar-reducer'
import cls from 'classnames'


export class Calendar extends Component {
  static propTypes = {
    initialSelectionData: PT.object,
    selectionData: PT.object.isRequired,
    onDateSet: PT.func,
    hourScaleGap: PT.number,
    hourLabelFormat: PT.string,
    bemBlockName: PT.string
  }
  static defaultProps = {
    onDateSet: R.identity,
    hourScaleGap: 3,
    hourLabelFormat: 'HH:mm',
    bemBlockName: 'Calendar',
    initialSelectionData: R.map(R.always([]))(DAY_KEYS)
  }
  constructor(props) {
    super(props);
    this.rDay = this.rDay.bind(this)
    this.rCaptionHours = this.rCaptionHours.bind(this)
  }
  componentWillMount () {
    const {initialSelectionData, initCalendarSelection, hourScaleGap} = this.props
    initCalendarSelection(initialSelectionData)
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
      const cellMinutes = hour * MINUTES_IN_HOUR
      const owningSelectionIdx = R.findIndex(Calendar.findOwningSelection(cellMinutes), selectedMinutes)
      const owningSelection = selectedMinutes[owningSelectionIdx]
      return <td
        className={cls(`${bemBlockName}__cell ${bemBlockName}__dayHour`, {
          isSelected: owningSelection
        })}
        onClick={R.partial(toggleHourSelection, [{
          dayKey, cellMinutes, owningSelection, owningSelectionIdx
        }])}
        key={hour} />
    }
  }
  rDay(selectedMinutes, dayKey) {
    const {hourScaleGap, bemBlockName} = this.props
    const row = {
      label: <td
        className={`${bemBlockName}__cell ${bemBlockName}__dayKey`}
        colSpan={hourScaleGap}
        >{dayKey}</td>,

      allDay: <td
        className={`${bemBlockName}__cell ${bemBlockName}__daySelectAll`}
        colSpan={hourScaleGap}
      />,

      hours: R.map(this.rDayHours({selectedMinutes, dayKey}), DAY_HOURS_LIST)
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
      )(DAY_HOURS_LIST)
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
Calendar.findOwningSelection = (val) => ({bt, et}) => val >= bt && val < et

export default R.pipe(
  connect(
    (state) => ({
      selectionData: state.calendar
    }),
    {initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection}
  )
)(Calendar)
