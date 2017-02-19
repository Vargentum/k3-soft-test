'use strict'
import React from 'react'
import { storiesOf, action } from '@kadira/storybook'
import {decorateAction} from '@kadira/storybook-addon-actions'
import { Provider } from 'react-redux'
import store from '../redux/store'

import Welcome from './Welcome'
import Button from './Button'

import Calendar from './Calendar'
import basicData from '../fixtures/basic.json'

const firstArgAction = decorateAction([
  args => [args[0].selectionData]
]);

storiesOf('Calendar', module)
  .addDecorator((getStory) =>
    <Provider store={store}>{getStory()}</Provider>
  )
  .add('Default', () => {
    const id = 'demo-calendar'
    return <Calendar 
      id={id}
      initialSelectionData={basicData} 
      onSelectionSave={firstArgAction(id)}
    />
  })
