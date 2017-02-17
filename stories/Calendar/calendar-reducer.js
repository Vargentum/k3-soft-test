import createReducer from 'create-reducer-map'
// import update from 'immutability-helper'
import R from 'ramda'

// ------------------------------------
// Constants
// ------------------------------------
const NAMESPACE = 'calendar/'
const TOGGLE_HOUR_SELECTION = NAMESPACE + 'TOGGLE_HOUR_SELECTION'
const TOGGLE_DAY_SELECTION = NAMESPACE + 'TOGGLE_DAY_SELECTION'
const CLEAR_DAY = NAMESPACE + 'CLEAR_DAY'
const INIT_CALENDAR_SELECTION = NAMESPACE + 'INIT_CALENDAR_SELECTION'
const CLEAR_CALENDAR_SELECTION = NAMESPACE + 'CLEAR_CALENDAR_SELECTION'

// ------------------------------------
// Actions
// ------------------------------------
export const initCalendarSelection = ({selectionData}) => ({
  type: INIT_CALENDAR_SELECTION,
  payload: {selectionData}
})
export const clearCalendarSelection = () => ({
  type: CLEAR_CALENDAR_SELECTION
})
export const toggleHourSelection = ({day, hour}) => ({
  type: TOGGLE_HOUR_SELECTION,
  payload: {day, hour}
})
export const toggleDaySelection = ({day}) => ({
  type: TOGGLE_DAY_SELECTION,
  payload: {day}
})

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState = {
  selection: {}
}
export default createReducer(initialState, {
  [INIT_CALENDAR_SELECTION]: (state, {selectionData}) => R.assoc('selection', selectionData, state)
  ,[CLEAR_CALENDAR_SELECTION]: (state) => R.assoc('selection', initialState.selection, state)
  ,[TOGGLE_DAY_SELECTION]: (state, {day}) => R.identity
  ,[TOGGLE_HOUR_SELECTION]: (state, {day, hour}) => R.identity
})
