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

const tabs = [{
  name: 'Home', value: '/'
}, {
  name: 'Breeds', value: '/breeds'
}, {
  name: 'Matches', value: '/matches'
}]

function Header({ location, history }) {
  return (
    <AppBar iconElementLeft={<FontIcon style={iconStyles} className="fas fa-paw" />} title={'Who\'s a good dog?'}>
      <Tabs value={location.pathname} onChange={(v) => history.push(v)}>
        {tabs.map(tab => 
          <Tab key={`tab-${tab.name}`} label={`\u00A0\u00A0\u00A0${tab.name}\u00A0\u00A0\u00A0`} value={tab.value} />
        )}
      </Tabs>
    </AppBar>
  );
};

export default withRouter(Header);
