import React, { Component } from 'react';
import { Route } from 'react-router';

import Home from 'components/Home';
import Matches from 'components/Matches';
import Preferences from 'components/Preferences';

export default function Body() {
  return (
    <main>
      <Route exact path='/' component={Home}/>
      <Route exact path='/matches' component={Matches}/>
      <Route exact path='/preferences' component={Preferences}/>
    </main>
  );
}
