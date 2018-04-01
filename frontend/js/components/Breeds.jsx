import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import Carousel from 'nuka-carousel';

import { likeBreed } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';
import { capitalizeFirstLetter } from 'infra/utils';

function mapStateToProps({ currentBreeds, preferences, breedsInfiniteLoading }) {
  return { currentBreeds, preferences, breedsInfiniteLoading };
}

function keypress(e) {
  if (e.keyCode === 38) likeBreed();
}

class Breeds extends Component {

  state = {
    modalOpen: false,
    selectedNumber: 0,
    selectedBreed: null
  }

  handleOpen = (breed, i) => {
    this.setState({
      modalOpen: true,
      selectedNumber: i,
      selectedBreed: breed
    });
  }

  handleClose = () => {
    this.setState({
      modalOpen: false,
      selectedNumber: 0,
      selectedBreed: null
    });
  }

  buildSlideshow = () => {
    const { selectedBreed } = this.state;
    return (
      <Carousel slideWidth="400px">
        {selectedBreed.img.map(image => <img style={{height: '300px', width: '400px'}} src={image} />)}
      </Carousel>
    );
  }

  buildDialog = () => {
    const { selectedBreed, modalOpen, selectedNumber } = this.state;
    const actions = [<FlatButton label="Save ❤️ " onClick={() => { likeBreed(selectedNumber); this.handleClose(); }} />];

    if (selectedBreed === null) {
      return null;
    } else {
      return (
        <Dialog actions={actions} style={{marginTop: '-200px'}} title={capitalizeFirstLetter(selectedBreed.name)}
            modal={false} open={modalOpen} onRequestClose={this.handleClose}>
          {this.buildSlideshow()}
          <br />
          {`${selectedBreed.name} Description here`}
        </Dialog>
      );
    }
  }

  buildBreedCard = (breed, i) => {
    return (
      <Col lg={4} xs={12} key={`breed-${breed.name}-${i}`}>
        <Card style={{margin: 'auto', marginTop: '20px'}}>
          <div onClick={() => this.handleOpen(breed, i)}>
            <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={capitalizeFirstLetter(breed.name)} />}>
              <img style={{height: '300px', width: '200px'}} src={breed.img.get(0)} alt={breed.name} />
            </CardMedia>
          </div>
          <CardActions>
            <FlatButton label="Save ❤️ " onClick={() => likeBreed(i)} />
          </CardActions>
        </Card>
      </Col>
    );
  }

  render() {
    const { currentBreeds, preferences } = this.props;

    return (
      <Container fluid>
        <Row>
          {currentBreeds.map(this.buildBreedCard)}
        </Row>
        <RaisedButton style={{marginTop: '20px'}} secondary={true} label="Get More Breeds" onClick={() => requestMoreBreeds(preferences)} />
        {this.buildDialog()}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Breeds);
