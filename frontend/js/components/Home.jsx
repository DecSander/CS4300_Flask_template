import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import { likeBreed } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ currentBreeds, preferences }) {
  return { currentBreeds, preferences };
}

function keypress(e) {
  if (e.keyCode === 38) likeBreed();
}

class Home extends Component {

  componentDidMount() {
    document.addEventListener('keyup', keypress);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', keypress);
  }

  render() {
    const { currentBreeds, preferences } = this.props;

    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 5}} lg={2} xs={12}>
            <Infinite containerHeight={900} infiniteLoadBeginEdgeOffset={300} elementHeight={350} onInfiniteLoad={() => { requestMoreBreeds(preferences); }}>
              {currentBreeds.map((breed, i) =>
                <Card style={{margin: 'auto'}}>
                  <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={breed.name} />}>
                    <img src={breed.img} alt={breed.name} />
                  </CardMedia>
                  <CardActions>
                    <FlatButton label="Like ❤️ " onClick={() => likeBreed(i)} />
                  </CardActions>
                </Card>
              )}
            </Infinite>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Home);
