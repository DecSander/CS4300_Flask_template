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

  submit = () => {
    const { history, preferences } = this.props;
    if (this.props.checkPreferences) {
      history.push('/preferences');
    } else {
      requestMoreBreeds(preferences);
      history.push('/breeds');
    }
  }

  keypress = (e) => {
    if (e.keyCode === 13) this.submit();
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
    const { history, checkPreferences } = this.props;
    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 4}} lg={4} xs={12}>
            <div style={{textAlign: 'center', fontWeight: '200', fontFamily: 'roboto', color: 'blue'}}>
              <h1 style={{fontSize: '56px'}}>Who's A Good Dog?</h1>
              <h3 style={{fontSize: '30px'}}>Find out which dog you should get</h3>
              <TextField floatingLabelStyle={{color: 'blue'}} style={{width: '500px', fontSize: '30px'}} floatingLabelText="Search" onChange={(e, v) => updatePreference('keywords', v)} />
              <Toggle label="More Preferences" toggled={checkPreferences} onToggle={(e, v) => changeCheckPreferences(v)} />
              <br />
              <RaisedButton secondary={true} onClick={this.submit}>Submit</RaisedButton>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default connect(mapStateToProps)(withRouter(Home));
