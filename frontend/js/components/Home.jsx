import React from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import { withRouter } from 'react-router-dom';
import scrollToComponent from 'react-scroll-to-component';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import FontIcon from 'material-ui/FontIcon';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { updatePreference, changeCheckPreferences, changeSearch, resetPageNumber } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';
import Preferences from 'components/Preferences';
import { breeds } from 'infra/const';
import { formatText } from 'infra/utils';

function mapStateToProps({ checkPreferences, preferences, search, page }) {
  return { checkPreferences, preferences, search, page };
}

const iconStyles = {
  marginTop: 10,
  marginLeft: 10,
  marginRight: 0,
  color: 'white',
  cursor: 'pointer'
};

class Home extends React.Component {

  submitNoPrefs = () => {
    const { history, preferences, search, page } = this.props;
    resetPageNumber();
    changeCheckPreferences(false);
    requestMoreBreeds(1, search, preferences, false);
    history.push('/breeds');
  }

  submitWithPrefs = () => {
    changeCheckPreferences(true);
    resetPageNumber();
    scrollToComponent(this.Preferences, { offset: 0, align: 'top', duration: 400})
  }

  keypress = (e) => {
    if (e.keyCode === 13) this.submitNoPrefs();
  }

  componentWillMount() {
    document.addEventListener('keyup', this.keypress);

    // Add Home wallpaper
    document.getElementsByTagName("body")[0].className += ' background';
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keypress);

    // Remove Home wallpaper
    const element = document.getElementsByTagName("body")[0];
    element.className = element.className.replace(/background/g, '');
  }

  render() {
    const { search } = this.props;
    return (
      <Container fluid>
        <Row style={{marginBottom: '75vh'}}>
          <Col offset={{lg: 3}} lg={6} xs={12}>
            <div style={{textAlign: 'center', fontWeight: '200', fontFamily: 'roboto', color: 'black'}}>
              <h1 style={{backgroundColor: 'white', fontSize: '56px'}}>Who's A Good Dog?</h1>
              <TextField hintStyle={{width: '100%', color: 'black', textAlign: 'center'}} inputStyle={{color: 'black', marginTop: '-5px'}}
                style={{width: '50%', fontSize: '20px', marginRight: '20px'}} value={search} hintText={"What kind of dog do you want?"} onChange={(e, v) => changeSearch(v)} />
              <RaisedButton secondary={true} overlayStyle={{color: 'white'}}
                onClick={this.submitNoPrefs}>Search</RaisedButton>
              <br />
              <br />
              <RaisedButton primary={true} overlayStyle={{color: 'white', paddingRight: '20px', paddingLeft: '20px', marginTop: '-8px'}} buttonStyle={{height: '40px'}} style={{marginTop: '40px'}}
                style={{marginRight: '20px'}} onClick={this.submitWithPrefs}><span style={{fontSize: '24px'}}>More Preferences</span> <FontIcon style={iconStyles} className="fas fa-chevron-circle-down" /></RaisedButton>
            </div>
          </Col>
        </Row>
        <Row>
          <Col style={{backgroundColor: 'white'}} offset={{lg: 2}} lg={8} xs={12}>
            <Preferences />
          </Col>
        </Row>
      </Container>
    );
  }
};

export default connect(mapStateToProps)(withRouter(Home));
