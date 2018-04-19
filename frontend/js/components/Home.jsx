import React from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import { withRouter } from 'react-router-dom';
import scrollToComponent from 'react-scroll-to-component';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

import { updatePreference, changeCheckPreferences, changeSearch } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';
import Preferences from 'components/Preferences';

function mapStateToProps({ checkPreferences, preferences, search }) {
  return { checkPreferences, preferences, search };
}

class Home extends React.Component {

  submitNoPrefs = () => {
    const { history, preferences, search } = this.props;
    changeCheckPreferences(false);
    requestMoreBreeds(search, preferences, false);
    history.push('/breeds');
  }

  submitWithPrefs = () => {
    changeCheckPreferences(true);
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
    return (
      <Container fluid>
        <Row style={{marginBottom: '75vh'}}>
          <Col offset={{lg: 4}} lg={4} xs={12}>
            <div style={{textAlign: 'center', fontWeight: '200', fontFamily: 'roboto', color: 'black'}}>
              <h1 style={{backgroundColor: 'white', fontSize: '56px'}}>Who's A Good Dog?</h1>
              <TextField floatingLabelStyle={{color: 'black'}} inputStyle={{color: 'black'}}
                style={{width: '500px', fontSize: '30px'}} value={this.props.search} floatingLabelText="What kind of dog do you want?" onChange={(e, v) => changeSearch(v)} />
              <br />
              <RaisedButton primary={true} overlayStyle={{color: 'white', paddingLeft: '50px', paddingRight: '50px'}}
                style={{marginRight: '20px'}} onClick={this.submitWithPrefs}>More Preferences</RaisedButton>
              <RaisedButton secondary={true} overlayStyle={{color: 'white', paddingLeft: '50px', paddingRight: '50px'}}
                onClick={this.submitNoPrefs}>Submit</RaisedButton>
            </div>
          </Col>
        </Row>
        <Row>
          <Col style={{backgroundColor: 'white'}} offset={{lg: 2}} lg={8} xs={12}>
            <Preferences ref={(section) => { this.Preferences = section; }} />
          </Col>
        </Row>
      </Container>
    );
  }
};

export default connect(mapStateToProps)(withRouter(Home));
