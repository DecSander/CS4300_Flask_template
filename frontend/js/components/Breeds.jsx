import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';

import { likeBreed } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ currentBreeds, preferences, isInfiniteLoading }) {
  return { currentBreeds, preferences, isInfiniteLoading };
}

function keypress(e) {
  if (e.keyCode === 38) likeBreed();
}

class Breeds extends Component {

  requestBreeds = () => {
    setTimeout(requestMoreBreeds(this.props.preferences), 8000);
  }

  componentDidMount() {
    document.addEventListener('keyup', keypress);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', keypress);
  }

  elementInfiniteLoad() {
    return (
      <CircularProgress />
    );
  }

  render() {
    const { currentBreeds, preferences, isInfiniteLoading } = this.props;

    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 5}} lg={2} xs={12}>
            <Infinite containerHeight={900}
                infiniteLoadBeginEdgeOffset={300}
                elementHeight={350}
                loadingSpinnerDelegate={this.elementInfiniteLoad()}
                isInfiniteLoading={isInfiniteLoading}
                onInfiniteLoad={this.requestBreeds}>
              {currentBreeds.map((breed, i) =>
                <Card style={{margin: 'auto'}} key={`${breed.name}-${i}`}>
                  <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={breed.name} />}>
                    <img src={breed.img} alt={breed.name} />
                  </CardMedia>
                  <CardActions>
                    <FlatButton label="Save ❤️ " onClick={() => likeBreed(i)} />
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

export default connect(mapStateToProps)(Breeds);
