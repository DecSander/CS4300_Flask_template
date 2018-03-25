import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { Container, Row, Col } from 'react-grid-system'

import { likeBreed, dislikeBreed } from 'infra/GlobalActions';

function mapStateToProps({ currentBreeds }) {
  return { currentBreeds };
}

function keypress(e) {
  if (e.keyCode === 39) likeBreed();
  else if (e.keyCode === 37) dislikeBreed();
}

class Home extends Component {

  componentDidMount() {
    document.addEventListener('keyup', keypress);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', keypress);
  }

  render() {
    const { currentBreeds } = this.props;

    if (currentBreeds.size === 0) return null;

    const current = currentBreeds.get(0);
    return (
      <Container fluid>
        <Row>
          <Col offset={{md: 4}} lg={4} xs={12}>
            <Card style={{margin: 'auto'}}>
              <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={current.name} />}>
                <img src={current.img} alt={current.name} />
              </CardMedia>
              <CardActions>
                <FlatButton label="← Dislike" onClick={dislikeBreed} />
                <FlatButton label="Like →" onClick={likeBreed} />
              </CardActions>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Home);
