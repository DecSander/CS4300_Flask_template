import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Infinite from 'react-infinite';
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card';

function mapStateToProps({ liked }) {
  return { liked };
}

function Matches({ liked }) {
  return (
    <Container fluid>
      <Row>
        <Col offset={{lg: 5}} lg={2} xs={12}>
          <Infinite containerHeight={900} infiniteLoadBeginEdgeOffset={300} elementHeight={350}>
            {liked.map((breed, i) =>
              <Card style={{margin: 'auto'}}>
                <CardMedia style={{width: 400, height: 300}} overlay={<CardTitle title={breed.name} />}>
                  <img src={breed.img} alt={breed.name} />
                </CardMedia>
              </Card>
            )}
          </Infinite>
        </Col>
      </Row>
    </Container>
  );
}

export default connect(mapStateToProps)(Matches);
