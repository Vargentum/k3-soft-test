'use strict'
import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import { Provider } from 'react-redux'
import store from '../redux/store'

import Welcome from './Welcome';
import Button from './Button';
import Calendar from './Calendar';

storiesOf('Calendar', module)
  .addDecorator((getStory) => 
    <Provider store={store}>{getStory()}</Provider>
  )
  .add('Default', () => (
    <Calendar />
  ))

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ));
