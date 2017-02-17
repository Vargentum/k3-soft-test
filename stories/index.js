'use strict'
import React from 'react'
import { storiesOf, action, linkTo } from '@kadira/storybook'
import { Provider } from 'react-redux'
import store from '../redux/store'

import Welcome from './Welcome'
import Button from './Button'

import Calendar from './Calendar'
import basicData from '../fixtures/basic.json'

storiesOf('Calendar', module)
  .addDecorator((getStory) =>
    <Provider store={store}>{getStory()}</Provider>
  )
  .add('Default', () => (
    <Calendar 
      initialSelectionData={basicData} 
      onDateSet={action}
    />
  ))

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')} />
  ))

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ))
