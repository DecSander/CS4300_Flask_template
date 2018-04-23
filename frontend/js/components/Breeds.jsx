import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import Badge from 'material-ui/Badge';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Carousel from 'nuka-carousel';

import Contributions from 'components/Contributions';
import { likeBreed, resetBreedList } from 'infra/GlobalActions';
import { requestMoreBreeds, getSimilarDogs } from 'infra/api';
import { formatText } from 'infra/utils';

function mapStateToProps({ search, currentBreeds, preferences, breedsLoading, checkPreferences,
    retrievingSimilarDogs, page, similarDogs, failedRetrieveDogs, retrievedBreed }) {
  return { search, currentBreeds, preferences, breedsLoading, checkPreferences,
    retrievingSimilarDogs, page, similarDogs, failedRetrieveDogs, retrievedBreed };
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
        {selectedBreed.img.map((image, i) => <img key={`img-${selectedBreed.name}-${i}`} style={{height: '300px', width: '400px'}} src={image} />)}
      </Carousel>
    );
  }

  buildSimilarDog = (dog) => {
    return (
      <Col lg={3}><Card>
        <CardMedia style={{width: '100%', height: 100}}>
          <img style={{width: '100%', height: 100}} src={dog.img} alt={dog.name} />
        </CardMedia>
      </Card>{dog.name}</Col>
    );
  }

  buildDialog = () => {
    const { similarDogs, retrievingSimilarDogs, failedRetrieveDogs, retrievedBreed } = this.props;
    const { selectedBreed, modalOpen, selectedNumber } = this.state;
    const actions = [<FlatButton label="Save ❤️ " onClick={() => { likeBreed(selectedNumber); this.handleClose(); }} />];
    if (selectedBreed === null) {
      return null;
    } else {
      if (!retrievingSimilarDogs && (selectedBreed !== retrievedBreed) && !failedRetrieveDogs) getSimilarDogs(selectedBreed.name);
      const similarDogs2 = [{name: 'Dog1', img: '/static/img/corgi.jpg'}, {name: 'Dog2', img: '/static/img/husky.jpg'}]
      const similarDogsComponent = retrievingSimilarDogs
        ? <CircularProgress size={25} thickness={4} />
        : <Row>{similarDogs2.slice(0, 4).map(this.buildSimilarDog)}</Row>;

      return (
        <Dialog style={{marginTop: '-200px'}} title={formatText(selectedBreed.name)}
            autoScrollBodyContent={true}
            modal={false} open={modalOpen} onRequestClose={this.handleClose} actions={actions}>
          {this.buildSlideshow()}
          <br />
          {`${selectedBreed.description}`}
          <br /><br /><br />
          {selectedBreed.contributions.size > 0 ? 'Why this is a good dog:' : null}
          <Contributions values={selectedBreed.contributions} />
          <br />
          {similarDogs2.length > 0 ? 'Similar Dogs:' : null}
          {similarDogsComponent}
        </Dialog>
      );
    }
  }

  buildLoading = () => {
    return (
      <Col lg={4} xs={12} style={{textAlign: 'center', paddingTop: '40px'}}>
        <CircularProgress size={100} thickness={8} />
      </Col>
    );
  }

  buildBreedCard = (breed, i) => {
    return (
      <Col lg={4} xs={12} key={`breed-${breed.name}-${i}`}>
        <Badge style={{width: '100%'}} badgeStyle={{fontSize: 24, width: 48, height: 48, marginRight: 30, marginTop: 20}}
            badgeContent={`${breed.match}%`} primary={true}>
          <Card style={{margin: 'auto', marginTop: '20px'}}>
            <div onClick={() => this.handleOpen(breed, i)}>
              <CardMedia style={{width: '100%', height: 400}} overlay={<CardTitle title={formatText(breed.name)} />}>
                <img style={{width: '100%', height: 400}} src={breed.img.get(0)} alt={breed.name} />
              </CardMedia>
            </div>
            <CardActions>
              <FlatButton label="Save ❤️ " onClick={() => likeBreed(i)} />
            </CardActions>
          </Card>
        </Badge>
      </Col>
    );
  }

  buildBreedCards = () => {
    const { page, currentBreeds, preferences, breedsLoading, checkPreferences, search } = this.props;

    const cards = currentBreeds.map(this.buildBreedCard);
    const loading = breedsLoading ? this.buildLoading() : null;
    const noMatches = currentBreeds.size === 0 && !breedsLoading ?
      <Col lg={4} xs={12} style={{textAlign: 'center', paddingTop: '40px'}}><h1>No Breeds Found 😫</h1></Col>
      : null;

    return (
      <Container fluid>
        <Row>
          {cards}
          <Col lg={4} xs={12}>
            <Card style={{paddingTop: '20px'}}>
              <RaisedButton
                labelStyle={{height: '100%', fontSize: '40px'}}
                style={{height: '100%'}}
                buttonStyle={{height: '100%'}}
                overlayStyle={{height: '100%'}}
                fullWidth={true}
                secondary={true} label="Get More Breeds" onClick={() => requestMoreBreeds(page, search, preferences, checkPreferences)} />
              <RaisedButton
                labelStyle={{height: '100%', fontSize: '40px'}}
                style={{height: '100%', marginTop: '20px'}}
                buttonStyle={{height: '100%'}}
                overlayStyle={{height: '100%'}}
                fullWidth={true}
                primary={true} label="Reset Breeds" onClick={resetBreedList} />
              {this.buildDialog()}
            </Card>
          </Col>
          {noMatches}
          {loading}
        </Row>
      </Container>
    );
  }

  render() {
    return this.buildBreedCards();
  }
}

export default connect(mapStateToProps)(Breeds);
