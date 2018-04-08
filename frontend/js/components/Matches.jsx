import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import Carousel from 'nuka-carousel';

import { capitalizeFirstLetter } from 'infra/utils';

function mapStateToProps({ liked, likedLoading }) {
  return { liked, likedLoading };
}

class Matches extends React.Component {

  state = {
    modalOpen: false,
    selectedBreed: null,
    selectedNumber: 0
  }

  handleOpen = (breed, i) => {
    this.setState({
      modalOpen: true,
      selectedBreed: breed,
      selectedNumber: i
    });
  }

  handleClose = () => {
    this.setState({
      modalOpen: false,
      selectedBreed: null,
      selectedNumber: 0
    });
  }

  buildSlideshow = () => {
    const { selectedBreed } = this.state;
    return (
      <Carousel slideWidth="400px">
        {selectedBreed.img.map((image, i) =>
          <img key={`img-${selectedBreed.name}-${i}`} style={{height: '300px', width: '400px'}} src={image} />
        )}
      </Carousel>
    );
  }

  buildDialog = () => {
    const { selectedBreed, modalOpen } = this.state;
    if (selectedBreed === null) {
      return null;
    } else {
      return (
        <Dialog style={{marginTop: '-200px'}} title={capitalizeFirstLetter(selectedBreed.name)}
            modal={false} open={modalOpen} onRequestClose={this.handleClose}>
          {this.buildSlideshow()}
          <br />
          {'Breed Description here'}
        </Dialog>
      );
    }
  }

  buildLikedCards = () => {
    const { liked, likedLoading } = this.props;
    if (likedLoading) {
      return <Col style={{textAlign: 'center'}} offset={{lg: 4}}><CircularProgress /></Col>;
    } else if (liked.size === 0) {
      return <div>No Matches yet 😞</div>
    } else {
      return liked.map((breed, i) =>
        <Col lg={4} xs={12} key={`match-${breed.name}-${i}`}>
          <Card style={{margin: 'auto', marginTop: '20px'}}>
            <div onClick={() => this.handleOpen(breed, i)}>
              <CardMedia style={{width: 525, height: 300}} overlay={<CardTitle title={capitalizeFirstLetter(breed.name)} />}>
                <img style={{width: 525, height: 300}} src={breed.img.get(0)} alt={breed.name}/>
              </CardMedia>
            </div>
            <CardActions>
              <FlatButton label="See More" onClick={() => this.handleOpen(breed, i)} />
            </CardActions>
          </Card>
        </Col>
      );
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          {this.buildLikedCards()}
        </Row>
        {this.buildDialog()}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Matches);
