import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import ResizeImage from 'react-resize-image';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

function mapStateToProps({ liked }) {
  return { liked };
}

class Matches extends React.Component {

  state = {
    modalOpen: false,
    selectedBreed: null
  }

  handleOpen = (breed) => {
    this.setState({
      modalOpen: true,
      selectedBreed: breed
    });
  }

  handleClose = () => {
    this.setState({
      modalOpen: false,
      selectedBreed: null
    });
  }

  buildDialog = () => {
    const { selectedBreed, modalOpen } = this.state;
    if (selectedBreed === null) {
      return null;
    } else {
      return (
        <Dialog title={selectedBreed.name} modal={false} open={modalOpen} onRequestClose={this.handleClose}>
          <ResizeImage src={selectedBreed.img} alt={selectedBreed.name} options={{height: 100, width: 100, 'mode': 'pad'}} />
          {'Breed Description here'}
        </Dialog>
      );
    }
  }

  buildLikedCards = () => {
    const { liked } = this.props;
    if (liked.size === 0) {
      return <div>No Matches yet 😞</div>
    } else {
      return liked.map((breed, i) =>
        <Card style={{margin: 'auto'}}>
          <div onClick={() => this.handleOpen(breed)}>
            <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={breed.name} />}>
              <ResizeImage src={breed.img} alt={breed.name} options={{height: 100, width: 100, 'mode': 'pad'}} />
            </CardMedia>
          </div>
          <CardActions>
            <FlatButton label="See More" onClick={() => this.handleOpen(breed)} />
          </CardActions>
        </Card>
      );
    }
  }

  render() {
    const dialog = this.buildDialog();
    const likedCards = this.buildLikedCards();

    return (
      <Container fluid>
        <Row>
          <Col offset={{lg: 5}} lg={2} xs={12}>
            <Infinite containerHeight={900} infiniteLoadBeginEdgeOffset={300} elementHeight={350}>
              {likedCards}
            </Infinite>
          </Col>
        </Row>
        {dialog}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Matches);
