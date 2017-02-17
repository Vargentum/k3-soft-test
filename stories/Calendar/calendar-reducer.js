import createReducer from 'create-reducer-map'
import R from 'ramda'
// import {Calendar} from './Calendar'

// ------------------------------------
// Constants
// ------------------------------------
export const DAY_HOURS_LIST = R.range(0, 24)
export const DAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
export const MINUTES_IN_HOUR = 60

const NAMESPACE = 'calendar/'
const TOGGLE_HOUR_SELECTION = NAMESPACE + 'TOGGLE_HOUR_SELECTION'
const TOGGLE_DAY_SELECTION = NAMESPACE + 'TOGGLE_DAY_SELECTION'
const CLEAR_DAY = NAMESPACE + 'CLEAR_DAY'
const INIT_CALENDAR_SELECTION = NAMESPACE + 'INIT_CALENDAR_SELECTION'
const CLEAR_CALENDAR_SELECTION = NAMESPACE + 'CLEAR_CALENDAR_SELECTION'

// ------------------------------------
// Actions
// ------------------------------------
export const initCalendarSelection = (selectionData) => ({
  type: INIT_CALENDAR_SELECTION,
  payload: {selectionData}
})
export const clearCalendarSelection = () => ({
  type: CLEAR_CALENDAR_SELECTION
})
export const toggleHourSelection = (payload) => ({
  type: TOGGLE_HOUR_SELECTION,
  payload
})
export const toggleDaySelection = ({day}) => ({
  type: TOGGLE_DAY_SELECTION,
  payload: {day}
})

// ------------------------------------
// Reducer
// ------------------------------------
const genSelectionFromMinutes = (minutes) => ({bt: minutes, et: minutes + MINUTES_IN_HOUR - 1})

const initialState = {}

export default createReducer(initialState, {
  [INIT_CALENDAR_SELECTION]: (state, {selectionData}) => selectionData
  ,[CLEAR_CALENDAR_SELECTION]: (state) => initialState
  ,[TOGGLE_DAY_SELECTION]: (state, {day}) => {

  }
  ,[TOGGLE_HOUR_SELECTION]: (state, {dayKey, cellMinutes, owningSelection, owningSelectionIdx}) => {
    const daySelectedRange = state[dayKey]
    const selectedRange = genSelectionFromMinutes(cellMinutes)
    let daySelectedRangeNew;
    if (owningSelection) {
      /*TODO: deselect*/
      return state
    }
    else {
      daySelectedRangeNew = R.append(selectedRange, daySelectedRange)
    }
    console.log(daySelectedRangeNew, dayKey, daySelectedRange, `daySelectedRangeNew---------`)
    /*TODO: apply merger*/
    return R.assoc(dayKey, daySelectedRangeNew, state)
  }
})
