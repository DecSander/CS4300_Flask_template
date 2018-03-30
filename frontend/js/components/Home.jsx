import React from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { updatePreference } from 'infra/GlobalActions';

class Home extends React.Component {

  componentWillMount() {
    document.getElementsByTagName("body")[0].className += ' background';
  }

  componentWillUnmount() {
    const element = document.getElementsByTagName("body")[0];
    element.className = element.className.replace(/background/g, '');
  }

  render() {
    const { history } = this.props;
    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 4}} lg={4} xs={12}>
            <div style={{textAlign: 'center', fontWeight: '200', fontFamily: 'roboto', color: 'blue'}}>
              <h1 style={{fontSize: '56px'}}>Who's A Good Dog?</h1>
              <h3 style={{fontSize: '30px'}}>Find out which dog you should get</h3>
              <TextField style={{paddingRight: '75px', marginRight: '20px'}} floatingLabelText="Search" onChange={(e, v) => updatePreference('keywords', v)} />
              <RaisedButton secondary={true} onClick={() => history.push('/preferences')}>Submit</RaisedButton>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default withRouter(Home);
