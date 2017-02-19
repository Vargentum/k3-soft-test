import createReducer from 'create-reducer-map'
import R from 'ramda'
import {util, CONSTANTS} from './utils'

// ------------------------------------
// Constants
// ------------------------------------
const NAMESPACE = 'calendar/'
const INIT_CALENDAR_SELECTION = NAMESPACE + 'INIT_CALENDAR_SELECTION'
const CLEAR_CALENDAR_SELECTION = NAMESPACE + 'CLEAR_CALENDAR_SELECTION'
const TOGGLE_HOUR_SELECTION = NAMESPACE + 'TOGGLE_HOUR_SELECTION'
const TOGGLE_DAY_SELECTION = NAMESPACE + 'TOGGLE_DAY_SELECTION'
const SELECT_HOURS_WITH_MOUSE = NAMESPACE + 'SELECT_HOURS_WITH_MOUSE'

// ------------------------------------
// Actions
// ------------------------------------
const initCalendarSelection = (payload) => ({
  type: INIT_CALENDAR_SELECTION,
  payload
})
const clearCalendarSelection = (payload) => ({
  type: CLEAR_CALENDAR_SELECTION,
  payload
})
const toggleHourSelection = (payload) => ({
  type: TOGGLE_HOUR_SELECTION,
  payload
})
const toggleDaySelection = (payload) => ({
  type: TOGGLE_DAY_SELECTION,
  payload
})
const selectHoursWithMouse = (payload) => ({
  type: SELECT_HOURS_WITH_MOUSE,
  payload
})

export const actions = {
  initCalendarSelection, clearCalendarSelection, toggleHourSelection, toggleDaySelection, selectHoursWithMouse
}

// ------------------------------------
// Selection data reducer
// ------------------------------------
export default createReducer({}, {
  [INIT_CALENDAR_SELECTION]: (state, { id, initialSelectionData }) => R.assoc(id, initialSelectionData, state),

  [CLEAR_CALENDAR_SELECTION]: (state, { id }) => R.assoc(id, CONSTANTS.EMPTY_DAYS_SELECTION, state),

  [TOGGLE_DAY_SELECTION]: (state, { id, dayKey, isAllDaySelected }) => {
    const day = isAllDaySelected
      ? []
      : [{ bt: 0, et: CONSTANTS.MINUTES_IN_DAY - 1 }]
    return R.assocPath([id, dayKey], day, state)
  },
  [TOGGLE_HOUR_SELECTION]: (state, { id, dayKey, hour, owningSelection, owningSelectionIdx }) => {
    const daySelectedRange = R.path([id, dayKey], state)
    let daySelectedRangeNew
    if (owningSelection) {
      const owningSelectionDuration = (owningSelection.et + 1 - owningSelection.bt) / CONSTANTS.MINUTES_IN_HOUR
      const hourlyBreakedOwningSelection = R.times(
        util.genHourlyBreakedSelection(owningSelection),
        owningSelectionDuration
      )
      const owningWithoutDeselected = R.reject(util.findHourOwningSelection(hour), hourlyBreakedOwningSelection)
      daySelectedRangeNew = R.pipe(
        R.update(owningSelectionIdx, owningWithoutDeselected),
        R.flatten
      )(daySelectedRange)
    } else {
      const selectedRange = util.genAtomicSelection(hour)
      daySelectedRangeNew = R.pipe(
        R.append(selectedRange),
        R.sortBy(R.prop('bt')) // for proper `collapse` applying
      )(daySelectedRange)
    }
    const collapsedSelections = util.collapseAtomicSelections(daySelectedRangeNew)
    return R.assocPath([id, dayKey], collapsedSelections, state)
  },
  [SELECT_HOURS_WITH_MOUSE]: (state, { id, mouseSelection }) => {
    const mergeDayWithMouseSelection = (daySelections, dayKey) => {
      const selectionsToMerge = R.pipe(
        R.filter(R.propEq('dayKey', dayKey)),
        R.map(R.pipe(R.prop('hour'), util.genAtomicSelection))
      )(mouseSelection)

      const mergedAndCollapsedSelections = R.pipe(
        R.concat(R.__, selectionsToMerge),
        R.sortBy(R.prop('bt')),
        util.collapseAtomicSelections
      )(daySelections)
      return mergedAndCollapsedSelections
    }
    const newDaySelections = R.mapObjIndexed(mergeDayWithMouseSelection)(state[id])
    return R.assoc(id, newDaySelections, state)
  }
})
