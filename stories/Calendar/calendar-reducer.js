import { combineReducers } from 'redux'
import createReducer from 'create-reducer-map'
import R from 'ramda'
// import {Calendar} from './Calendar'

// ------------------------------------
// Utils
// ------------------------------------
export const utils = {
  findHourOwningSelection: (hour) => ({bt, et}) => {
    const minutes = hour * MINUTES_IN_HOUR
    return minutes >= bt && minutes < et
  }
  ,genAtomicSelection: (hour) => ({bt: hour * MINUTES_IN_HOUR, et: (hour + 1) * MINUTES_IN_HOUR - 1})
  ,genAtomicSelectionRange: (h1, h2) => ({bt: h1 * MINUTES_IN_HOUR, et: h2 * MINUTES_IN_HOUR - 1})
  ,collapseAtomicSelections: R.reduce((acc, next) => {
    const currentIdx = acc.length - 1
    const current = acc[currentIdx]
    return current && next && (current.et + 1 === next.bt)
      ? R.update(currentIdx, R.assoc('et', next.et, current), acc)
      : R.append(next, acc)
  }, []),
  checkAllDaySelection: (sel) => sel && sel.bt === 0 && sel.et === MINUTES_IN_DAY - 1
}

utils.genHourlyBreakedSelection = (selection) => (hourIncrement) => {
  const eachHour = hourIncrement + selection.bt / MINUTES_IN_HOUR
  return utils.genAtomicSelection(eachHour)
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
const ADD_2D_SELECTION = NAMESPACE + 'ADD_2D_SELECTION'

const MOUSE_SELECTION_START = NAMESPACE + 'MOUSE_SELECTION_START'
const MOUSE_SELECTION_END = NAMESPACE + 'MOUSE_SELECTION_END'

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
const add2dSelection = (payload) => ({
  type: ADD_2D_SELECTION,
  payload: payload
})

const mouseSelectionStart = (payload) => ({
  type: MOUSE_SELECTION_START,
  payload: payload
})
const mouseSelectionEnd = (payload) => ({
  type: MOUSE_SELECTION_END,
  payload: payload
})



export const actions = {
  initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection, add2dSelection,
  mouseSelectionStart, mouseSelectionEnd
}

// ------------------------------------
// Selection data reducer
// ------------------------------------
const selectionDataReducer = createReducer({}, {
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
        utils.genHourlyBreakedSelection(owningSelection),
        owningSelectionDuration
      )
      const owningWithoutDeselected = R.reject(utils.findHourOwningSelection(hour), hourlyBreakedOwningSelection)
      daySelectedRangeNew = R.pipe(
        R.update(owningSelectionIdx, owningWithoutDeselected),
        R.flatten
      )(daySelectedRange)
    }
    else {
      const selectedRange = utils.genAtomicSelection(hour)
      daySelectedRangeNew = R.pipe(
        R.append(selectedRange),
        R.sortBy(R.prop('bt')) // for proper `collapse` applying
      )(daySelectedRange)
    }
    const collapsedSelections = utils.collapseAtomicSelections(daySelectedRangeNew)
    return R.assoc(dayKey, collapsedSelections, state)
  }
  ,[ADD_2D_SELECTION]: (state, {startX, startY, endX, endY}) => {
    return R.mapObjIndexed(
      (daySelection, dayKey) => {
        const dayIdx = R.findIndex(R.equals(dayKey), DAY_KEYS)
        console.log(dayIdx, startY, endY, `dayKey---------`)
        if (
          (dayIdx >= startY && dayIdx <= endY) || (dayIdx <= endY && dayIdx >= startY)
          ) {
          const a = R.pipe(
            R.append(utils.genAtomicSelectionRange(startX, endX)),
            R.sortBy(R.prop('bt')),
            utils.collapseAtomicSelections
          )(daySelection)
          return a
        } else {
          return daySelection
        }
      },
      state
    )
  }

})



/* -----------------------------
  Selection range reducer
----------------------------- */
const selectionRangeReducer = createReducer({}, {
  [MOUSE_SELECTION_START]: (state, {x, y}) => ({startX: x, startY: y})
  ,[MOUSE_SELECTION_END]: (state, {x, y}) => ({...state, endX: x, endY: y, isComplete: true})
})

export default combineReducers({
  selectionData: selectionDataReducer,
  selectionRange: selectionRangeReducer
})