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
import { removeMatch } from 'infra/GlobalActions';

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
        <Dialog style={{marginTop: '-200px'}} title={formatText(selectedBreed.name)}
            modal={false} open={modalOpen} onRequestClose={this.handleClose}>
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
