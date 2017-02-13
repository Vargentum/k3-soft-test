import createReducer from 'create-reducer-map'
// import update from 'immutability-helper'
// import R from 'ramda'

// ------------------------------------
// Constants
// ------------------------------------
const NAMESPACE = 'calendar/'
const SOME_CONST = NAMESPACE + 'SOME_CONST'

// ------------------------------------
// Actions
// ------------------------------------
export const someAction = () => ({
  type: SOME_CONST,
  payload: {}
})

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState = {}
export default createReducer(initialState, {
  // [SOME_CONST]: (state, payload) => update(state, {})
  [SOME_CONST]: (state, payload) => state
})
