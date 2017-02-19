'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import dateUtil from 'date-format-utils'
import {toArray} from 'lodash'
import './Calendar.styl'
import {connect} from 'react-redux'
import {
  util,
  DAY_KEYS, DAY_HOURS_LIST, MINUTES_IN_HOUR, MINUTES_IN_DAY,
  actions as calendarActions
} from './calendar-reducer'
import cls from 'classnames'
import { SelectableGroup, createSelectable } from 'react-selectable';


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
    hourLabelFormat: 'HH:mm', // https://www.npmjs.com/package/date-format-utils
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
  rDayHour ({selections, dayKey, dayIdx}) {
    const {bemBlockName, toggleHourSelection, mouseSelectionEnd, mouseSelectionStart} = this.props
    return ({hour}) => {
      const owningSelectionIdx = R.findIndex(util.findHourOwningSelection(hour), selections)
      const owningSelection = selections[owningSelectionIdx]
      return <td
        className={cls(`${bemBlockName}__cell ${bemBlockName}__dayHour`, {
          isSelected: owningSelection
        })}
        onClick={R.partial(toggleHourSelection, [{
          dayKey, hour, owningSelection, owningSelectionIdx
        }])}
        key={hour} />
    }
  }
  rDay(selections, dayKey) {
    const {hourScaleGap, bemBlockName, toggleDaySelection, selectionData} = this.props
    const dayIdx = R.findIndex(R.equals(dayKey), DAY_KEYS)
    const isAnyHourSelected = selections.length
    const isAllDaySelected = isAnyHourSelected && R.pipe(R.head, util.checkAllDaySelection)(selections)
    const Hour = this.rDayHour({selections, dayKey, dayIdx})
    const SelectableHour = createSelectable(Hour)
    const row = {
      label: <td
        className={cls(`${bemBlockName}__cell ${bemBlockName}__dayKey`, {
          isSelected: isAnyHourSelected
        })}
        colSpan={hourScaleGap}
        >{dayKey}</td>,

      allDay: <td
        className={`${bemBlockName}__cell ${bemBlockName}__daySelectAll`}
        colSpan={hourScaleGap}
        onClick={R.partial(toggleDaySelection, [{dayKey, isAllDaySelected}])}
        >{isAllDaySelected ? '-' : '+'}</td>,

      hours: R.map((hour) => {
        return <SelectableHour 
          selectableKey={{dayKey, hour}} 
          key={`${dayKey}${hour}`} 
          hour={hour} 
        />
      }, DAY_HOURS_LIST)
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
    const {selectionData, bemBlockName, selectHoursWithMouse} = this.props

    const bodyRows = R.pipe(R.mapObjIndexed(this.rDay), toArray)(selectionData)
    const headRow = this.rCaption()
    return (
        <table className={`${bemBlockName}`}>
          <thead>
            {headRow}
          </thead>
          <SelectableGroup 
            selectOnMouseMove={false}
            tolerance={1}
            onSelection={(selection) => selectHoursWithMouse(selection)}
            component="tbody"
            >
            {bodyRows}
          </SelectableGroup>
        </table>
    )
  }
}

export default R.pipe(
  connect(
    (state) => ({
      selectionData: state.calendar
    }),
    calendarActions
  )
)(Calendar)
