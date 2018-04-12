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
import Carousel from 'nuka-carousel';

import Contributions from 'components/Contributions';
import { likeBreed, resetBreedList } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';
import { formatText } from 'infra/utils';

function mapStateToProps({ currentBreeds, preferences, breedsLoading, checkPreferences }) {
  return { currentBreeds, preferences, breedsLoading, checkPreferences };
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
        <Dialog style={{marginTop: '-200px'}} title={formatText(selectedBreed.name)}
            modal={false} open={modalOpen} onRequestClose={this.handleClose} actions={actions}>
          {this.buildSlideshow()}
          <br />
          {`${selectedBreed.description}`}
          <br /><br /><br />
          Why this is a good dog:
          <Contributions values={selectedBreed.contributions} />
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
    const { currentBreeds, preferences, breedsLoading, checkPreferences } = this.props;

    const cards = currentBreeds.map(this.buildBreedCard);
    const loading = breedsLoading ? this.buildLoading() : null;

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
                secondary={true} label="Get More Breeds" onClick={() => requestMoreBreeds(preferences, checkPreferences)} />
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
