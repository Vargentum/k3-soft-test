import R from 'ramda'

/* -----------------------------
  Constants
----------------------------- */

const DAY_HOURS_LIST = R.range(0, 24)
const DAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
const MINUTES_IN_HOUR = 60
const MINUTES_IN_DAY = DAY_HOURS_LIST.length * MINUTES_IN_HOUR
const EMPTY_DAYS_SELECTION = R.pipe(
  R.map((key) => [key, []]),
  R.fromPairs
)(DAY_KEYS)

export const CONSTANTS = {DAY_HOURS_LIST, DAY_KEYS, MINUTES_IN_HOUR, MINUTES_IN_DAY, EMPTY_DAYS_SELECTION}

/* -----------------------------
  Utils
----------------------------- */

export const util = {
  findHourOwningSelection: (hour) => ({ bt, et }) => {
    const minutes = hour * MINUTES_IN_HOUR
    return minutes >= bt && minutes < et
  },
  genAtomicSelection: (hour) => ({ bt: hour * MINUTES_IN_HOUR, et: (hour + 1) * MINUTES_IN_HOUR - 1 }),
  genAtomicSelectionRange: (h1, h2) => ({ bt: h1 * MINUTES_IN_HOUR, et: h2 * MINUTES_IN_HOUR - 1 }),
  collapseAtomicSelections: R.reduce((acc, next) => {
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
