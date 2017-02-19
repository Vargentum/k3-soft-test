'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import dateUtil from 'date-format-utils'
import { toArray } from 'lodash'
import './Calendar.styl'
import { connect } from 'react-redux'
import {util, CONSTANTS} from './utils'
import {actions as calendarActions} from './calendar-reducer'
import cls from 'classnames'
import { SelectableGroup, createSelectable } from 'react-selectable'

export class Calendar extends Component {
  static propTypes = {
    id: PT.string.isRequired,
    initialSelectionData: PT.object,
    onSelectionSave: PT.func,
    hourScaleGap: PT.number,
    hourLabelFormat: PT.string,
    bemBlockName: PT.string
  }
  static defaultProps = {
    onSelectionSave: R.identity,
    hourScaleGap: 3,
    hourLabelFormat: 'HH:mm', // https://www.npmjs.com/package/date-format-utils
    bemBlockName: 'Calendar',
    initialSelectionData: CONSTANTS.EMPTY_DAYS_SELECTION
  }
  constructor (props) {
    super(props)
    this.rDay = this.rDay.bind(this)
    this.rCaptionHours = this.rCaptionHours.bind(this)
    this.handleSelectionClear = this.handleSelectionClear.bind(this)
    this.handleSelectionSave = this.handleSelectionSave.bind(this)
    this.handleMouseSelection = this.handleMouseSelection.bind(this)
  }
  componentWillMount () {
    const { id, initialSelectionData, initCalendarSelection, hourScaleGap } = this.props
    initCalendarSelection({ id, initialSelectionData })
  }
  toReadableHourLabel (hour) {
    const { hourLabelFormat } = this.props
    const label = new Date()
    label.setHours(hour)
    label.setMinutes(0)
    return dateUtil.formatDate(label, hourLabelFormat)
  }
  rDayHour ({ selections, dayKey, dayIdx }) {
    const { id, bemBlockName, toggleHourSelection } = this.props
    return ({ hour }) => {
      const owningSelectionIdx = R.findIndex(util.findHourOwningSelection(hour), selections)
      const owningSelection = selections[owningSelectionIdx]
      return <td
        className={cls(`${bemBlockName}__cell ${bemBlockName}__dayHour`, {
          isSelected: owningSelection
        })}
        onClick={R.partial(toggleHourSelection, [{
          id, dayKey, hour, owningSelection, owningSelectionIdx
        }])}
        key={hour} />
    }
  }
  rDay (selections, dayKey) {
    const { id, hourScaleGap, bemBlockName, toggleDaySelection, selectionData } = this.props
    const dayIdx = R.findIndex(R.equals(dayKey), CONSTANTS.DAY_KEYS)
    const isAnyHourSelected = selections.length
    const isAllDaySelected = isAnyHourSelected && R.pipe(R.head, util.checkAllDaySelection)(selections)
    const SelectableHour = createSelectable(this.rDayHour({ selections, dayKey, dayIdx }))
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
        onClick={R.partial(toggleDaySelection, [{ id, dayKey, isAllDaySelected }])}
        >{isAllDaySelected ? '-' : '+'}</td>,

      hours: R.map((hour) => {
        return <SelectableHour
          selectableKey={{ dayKey, hour }}
          key={`${dayKey}${hour}`}
          hour={hour}
        />
      }, CONSTANTS.DAY_HOURS_LIST)
    }
    return <tr key={dayKey}>
      {row.label}
      {row.allDay}
      {row.hours}
    </tr>
  }
  rCaptionHours (hour) {
    const { bemBlockName, hourScaleGap } = this.props
    const readableHourLabel = this.toReadableHourLabel(hour)
    return <td
      colSpan={hourScaleGap}
      className={`${bemBlockName}__caption ${bemBlockName}__captionDayHour`}
      key={readableHourLabel}
      >{readableHourLabel}</td>
  }
  rCaption () {
    const { hourScaleGap, bemBlockName } = this.props
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
      )(CONSTANTS.DAY_HOURS_LIST)
    }
    return <tr>
      {caption.label}
      {caption.allDay}
      {caption.hours}
    </tr>
  }
  handleSelectionClear () {
    const { id, clearCalendarSelection } = this.props
    clearCalendarSelection({ id })
  }
  handleSelectionSave () {
    const { id, selectionData, onSelectionSave } = this.props
    onSelectionSave({ id, selectionData })
  }
  handleMouseSelection (mouseSelection) {
    const { id, selectHoursWithMouse } = this.props
    selectHoursWithMouse({ id, mouseSelection })
  }
  render () {
    const { id, selectionData, bemBlockName, selectHoursWithMouse, clearCalendarSelection } = this.props

    const bodyRows = R.pipe(R.mapObjIndexed(this.rDay), toArray)(selectionData)
    const headRow = this.rCaption()
    return (
      <div>
        <table className={`${bemBlockName}`}>
          <thead>
            {headRow}
          </thead>
          <SelectableGroup
            selectOnMouseMove={false}
            tolerance={1}
            onSelection={this.handleMouseSelection}
            component='tbody'
            >
            {bodyRows}
          </SelectableGroup>
        </table>
        <br />
        <button onClick={this.handleSelectionClear}>Clear</button>
        <button onClick={this.handleSelectionSave}>Save</button>
      </div>
    )
  }
}

export default R.pipe(
  connect(
    (state, ownProps) => ({
      selectionData: state.calendar[ownProps.id]
    }),
    calendarActions
  )
)(Calendar)
