import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {grey900, green600} from 'material-ui/styles/colors';

import Body from 'components/Body';
import Header from 'components/Header';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: grey900,
    accent1Color: green600
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
