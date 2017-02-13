import { applyMiddleware, compose, createStore } from 'redux'
import rootReducer from './rootReducer'

// ======================================================
// Initial state
// ======================================================
const initialState = {}

// ======================================================
// Middleware Configuration
// ======================================================
const middleware = []

// ======================================================
// Store Enhancers
// ======================================================
const enhancers = []

let composeEnhancers = compose

const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
if (typeof composeWithDevToolsExtension === 'function') {
  composeEnhancers = composeWithDevToolsExtension
}

// ======================================================
// Store Instantiation and HMR Setup
// ======================================================
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  )
)

export default store