import React from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

import { updatePreference, changeCheckPreferences } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ checkPreferences, preferences }) {
  return { checkPreferences, preferences };
}

class Home extends React.Component {

  submitNoPrefs = () => {
    const { history, preferences } = this.props;
    changeCheckPreferences(false);
    requestMoreBreeds(preferences, false);
    history.push('/breeds');
  }

  submitWithPrefs = () => {
    changeCheckPreferences(true);
    this.props.history.push('/preferences');
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
    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 4}} lg={4} xs={12}>
            <div style={{textAlign: 'center', fontWeight: '200', fontFamily: 'roboto', color: 'black'}}>
              <h1 style={{backgroundColor: 'white', fontSize: '56px'}}>Who's A Good Dog?</h1>
              <h3 style={{backgroundColor: 'white', fontSize: '30px'}}>Find out which dog you should get</h3>
              <TextField floatingLabelStyle={{color: 'white'}} inputStyle={{color: 'white'}}
                style={{width: '500px', fontSize: '30px'}} floatingLabelText="Search" onChange={(e, v) => updatePreference('keywords', v)} />
              <br />
              <RaisedButton primary={true} overlayStyle={{color: 'white', paddingLeft: '50px', paddingRight: '50px'}}
                style={{marginRight: '20px'}} onClick={this.submitWithPrefs}>More Preferences</RaisedButton>
              <RaisedButton secondary={true} overlayStyle={{color: 'white', paddingLeft: '50px', paddingRight: '50px'}}
                onClick={this.submitNoPrefs}>Submit</RaisedButton>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default connect(mapStateToProps)(withRouter(Home));
