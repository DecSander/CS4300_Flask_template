import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import FontIcon from 'material-ui/FontIcon';

const iconStyles = {
  marginTop: 10,
  marginLeft: 10,
  marginRight: 15,
  color: 'white'
};

function Header({ location, history }) {
  return (
    <AppBar iconElementLeft={<FontIcon style={iconStyles} className="fas fa-paw" />} title={'Who\'s a good dog?'}>
      <Tabs value={location.pathname} onChange={(v) => history.push(v)}>
        <Tab label="&nbsp;&nbsp;Home&nbsp;&nbsp;" value='/' />
        <Tab label="&nbsp;&nbsp;Prefs&nbsp;&nbsp;" value='/preferences' />
        <Tab label="&nbsp;&nbsp;Breeds&nbsp;&nbsp;" value='/breeds' />
        <Tab label="&nbsp;&nbsp;Matches&nbsp;&nbsp;" value='/matches' />
      </Tabs>
    </AppBar>
  );
};

export default withRouter(Header);
