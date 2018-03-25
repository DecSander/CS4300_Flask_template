import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Body from 'components/Body';
import Header from 'components/Header';

export default function App() {
  return (
    <div>
      <MuiThemeProvider>
        <div>
          <Header />
          <Body />
        </div>
      </MuiThemeProvider>
    </div>
  );
}
