import React, { Component } from 'react';
import { Route } from 'react-router';

import Home from 'components/Home';
import Breeds from 'components/Breeds';
import Matches from 'components/Matches';
import Preferences from 'components/Preferences';

export default function Body() {
  return (
    <main>
      <Route exact path='/' component={Home}/>
      <Route exact path='/breeds' component={Breeds}/>
      <Route exact path='/matches' component={Matches}/>
    </main>
  );
}
