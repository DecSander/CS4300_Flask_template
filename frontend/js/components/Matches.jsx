import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import Carousel from 'nuka-carousel';

import Contributions from 'components/Contributions';
import { formatText } from 'infra/utils';
import { getSimilarDogs } from 'infra/api';
import { removeMatch } from 'infra/GlobalActions';

function mapStateToProps({ liked, likedLoading, retrievingSimilarDogs, similarDogs, failedRetrieveDogs, retrievedBreed }) {
  return { liked, likedLoading, retrievingSimilarDogs, similarDogs, failedRetrieveDogs, retrievedBreed };
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

  buildSimilarDog = (dog) => {
    return (
      <Col key={`similar-${dog.name}`} lg={3}><Card><a target="_blank" href={`https://www.google.com/search?q=${formatText(dog.name)}`}>
        <CardMedia style={{width: '100%', height: 100}}>
          <img style={{width: '100%', height: 100}} src={dog.img} alt={dog.name} />
        </CardMedia>
      </a></Card>{dog.name}</Col>
    );
  }

  buildDialog = () => {
    const { similarDogs, retrievingSimilarDogs, failedRetrieveDogs, retrievedBreed } = this.props;
    const { selectedBreed, modalOpen } = this.state;
    if (selectedBreed === null) {
      return null;
    } else {
      if (!retrievingSimilarDogs && (selectedBreed.name !== retrievedBreed) && !failedRetrieveDogs) getSimilarDogs(selectedBreed.name);
      const similarDogsComponent = retrievingSimilarDogs
        ? <CircularProgress size={25} thickness={4} />
        : <Row>{similarDogs.slice(0, 4).map(this.buildSimilarDog)}</Row>;

      return (
        <Dialog title={formatText(selectedBreed.name)} autoScrollBodyContent={true}
            modal={false} open={modalOpen} onRequestClose={this.handleClose}>
          {this.buildSlideshow()}
          <br />
          {`${selectedBreed.description}`}
          <br /><br /><br />
          {selectedBreed.contributions.size > 0 ? 'Why this is a good dog:' : null}
          <Contributions values={selectedBreed.contributions} />
          {similarDogs.size > 0 && !retrievingSimilarDogs ? 'Similar Dogs:' : null}
          {similarDogsComponent}
        </Dialog>
      );
    }
  }

  buildLikedCards = () => {
    const { liked, likedLoading } = this.props;
    if (likedLoading) {
      return <Col style={{textAlign: 'center', paddingTop: '40px'}}><CircularProgress size={100} thickness={8} /></Col>;
    } else if (liked.size === 0) {
      return <Col style={{textAlign: 'center', paddingTop: '40px'}}><h1>No Matches yet 😞</h1></Col>
    } else {
      return liked.map((breed, i) =>
        <Col lg={4} xs={12} key={`match-${breed.name}-${i}`}>
          <Card style={{margin: 'auto', marginTop: '20px'}}>
            <div onClick={() => this.handleOpen(breed, i)}>
              <CardMedia style={{width: '100%', height: 400}} overlay={<CardTitle title={formatText(breed.name)} />}>
                <img style={{width: '100%', height: 400}} src={breed.img.get(0)} alt={breed.name}/>
              </CardMedia>
            </div>
            <CardActions>
              <FlatButton label="See More" onClick={() => this.handleOpen(breed, i)} />
              <FlatButton label="Remove" onClick={() => removeMatch(i)} />
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
