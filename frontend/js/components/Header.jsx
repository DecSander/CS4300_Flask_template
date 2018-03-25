import React from 'react';
import { Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';

export default function Header() {
  return (
    <div>
      <Link to='/'><RaisedButton primary={true} style={{paddingRight: '10px'}}>Home</RaisedButton></Link>
      <Link to='/matches'><RaisedButton primary={true} style={{paddingRight: '10px'}}>Matches</RaisedButton></Link>
      <Link to='/preferences'><RaisedButton primary={true}>Preferences</RaisedButton></Link>
    </div>
  );
};
