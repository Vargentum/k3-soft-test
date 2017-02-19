import { combineReducers } from 'redux'
import createReducer from 'create-reducer-map'
import R from 'ramda'
// import {Calendar} from './Calendar'

// ------------------------------------
// Utils
// ------------------------------------
export const util = {
  findHourOwningSelection: (hour) => ({bt, et}) => {
    const minutes = hour * MINUTES_IN_HOUR
    return minutes >= bt && minutes < et
  }
  ,genAtomicSelection: (hour) => ({bt: hour * MINUTES_IN_HOUR, et: (hour + 1) * MINUTES_IN_HOUR - 1})
  ,genAtomicSelectionRange: (h1, h2) => ({bt: h1 * MINUTES_IN_HOUR, et: h2 * MINUTES_IN_HOUR - 1})
  ,collapseAtomicSelections: R.reduce((acc, next) => {
    const currentIdx = acc.length - 1
    const current = acc[currentIdx]
    return !current || !next || current.et + 1 < next.bt
      ? R.append(next, acc)
      : R.update(currentIdx, {
                              bt: R.min(current.bt, next.bt),
                              et: R.max(current.et, next.et)
                            }, acc)
  }, []),
  checkAllDaySelection: (sel) => sel && sel.bt === 0 && sel.et === MINUTES_IN_DAY - 1
}

util.genHourlyBreakedSelection = (selection) => (hourIncrement) => {
  const eachHour = hourIncrement + selection.bt / MINUTES_IN_HOUR
  return util.genAtomicSelection(eachHour)
}

// ------------------------------------
// Constants
// ------------------------------------
export const DAY_HOURS_LIST = R.range(0, 24)
export const DAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
export const MINUTES_IN_HOUR = 60
export const MINUTES_IN_DAY = DAY_HOURS_LIST.length * MINUTES_IN_HOUR

const NAMESPACE = 'calendar/'
const INIT_CALENDAR_SELECTION = NAMESPACE + 'INIT_CALENDAR_SELECTION'
const CLEAR_CALENDAR_SELECTION = NAMESPACE + 'CLEAR_CALENDAR_SELECTION'
const TOGGLE_HOUR_SELECTION = NAMESPACE + 'TOGGLE_HOUR_SELECTION'
const TOGGLE_DAY_SELECTION = NAMESPACE + 'TOGGLE_DAY_SELECTION'
const SELECT_HOURS_WITH_MOUSE = NAMESPACE + 'SELECT_HOURS_WITH_MOUSE'

// ------------------------------------
// Actions
// ------------------------------------
const initCalendarSelection = (selectionData) => ({
  type: INIT_CALENDAR_SELECTION,
  payload: {selectionData}
})
const clearCalendarSelection = () => ({
  type: CLEAR_CALENDAR_SELECTION
})
const toggleHourSelection = (payload) => ({
  type: TOGGLE_HOUR_SELECTION,
  payload
})
const toggleDaySelection = (payload) => ({
  type: TOGGLE_DAY_SELECTION,
  payload: payload
})
const selectHoursWithMouse = (mouseSelection) => ({
  type: SELECT_HOURS_WITH_MOUSE,
  payload: {mouseSelection}
})


export const actions = {
  initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection, selectHoursWithMouse
}

// ------------------------------------
// Selection data reducer
// ------------------------------------

export default createReducer({}, {
  [INIT_CALENDAR_SELECTION]: (state, {selectionData}) => selectionData
  ,[CLEAR_CALENDAR_SELECTION]: (state) => {}
  ,[TOGGLE_DAY_SELECTION]: (state, {dayKey, isAllDaySelected}) => {
    const day = isAllDaySelected
      ? []
      : [{bt: 0, et: MINUTES_IN_DAY - 1}]
    return R.assoc(dayKey, day, state)
  }
  ,[TOGGLE_HOUR_SELECTION]: (state, {dayKey, hour, owningSelection, owningSelectionIdx}) => {
    const daySelectedRange = state[dayKey]
    let daySelectedRangeNew;
    if (owningSelection) {
      const owningSelectionDuration = (owningSelection.et + 1 - owningSelection.bt) / MINUTES_IN_HOUR
      const hourlyBreakedOwningSelection = R.times(
        util.genHourlyBreakedSelection(owningSelection),
        owningSelectionDuration
      )
      const owningWithoutDeselected = R.reject(util.findHourOwningSelection(hour), hourlyBreakedOwningSelection)
      daySelectedRangeNew = R.pipe(
        R.update(owningSelectionIdx, owningWithoutDeselected),
        R.flatten
      )(daySelectedRange)
    }
    else {
      const selectedRange = util.genAtomicSelection(hour)
      daySelectedRangeNew = R.pipe(
        R.append(selectedRange),
        R.sortBy(R.prop('bt')) // for proper `collapse` applying
      )(daySelectedRange)
    }
    const collapsedSelections = util.collapseAtomicSelections(daySelectedRangeNew)
    return R.assoc(dayKey, collapsedSelections, state)
  }
  ,[SELECT_HOURS_WITH_MOUSE]: (state, {mouseSelection}) => {
    const mergeDayWithMouseSelection = (daySelections, dayKey) => {
      const selectionsToMerge = R.pipe(
        R.filter(R.propEq('dayKey', dayKey)),
        R.map(R.pipe(R.prop('hour'), util.genAtomicSelection)),
      )(mouseSelection)

      const mergedAndCollapsedSelections = R.pipe(
        R.concat(R.__, selectionsToMerge),
        R.sortBy(R.prop('bt')),
        util.collapseAtomicSelections
      )(daySelections)
      return mergedAndCollapsedSelections 
    }
    return R.mapObjIndexed(mergeDayWithMouseSelection)(state)
  }
})
