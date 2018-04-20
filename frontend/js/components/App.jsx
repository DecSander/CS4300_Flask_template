import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {grey700, orange600} from 'material-ui/styles/colors';

import Body from 'components/Body';
import Header from 'components/Header';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: grey700,
    accent1Color: orange600
  },
  appBar: {
    height: 60,
    width: '100%'
  }
});

export default function App() {
  return (
    <div>
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Header />
          <Body />
        </div>
      </MuiThemeProvider>
    </div>
  );
}
