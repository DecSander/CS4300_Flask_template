import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Accordion, AccordionItem, AccordionItemTitle, AccordionItemBody } from 'react-accessible-accordion';

import { updatePreference } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';
import { preferenceLabels } from 'infra/const';

function mapStateToProps({ preferences, search }) {
  return { preferences, search };
}

function buildSlider(preferences, id) {
  const labels = preferenceLabels[id];
  return (
    <div style={{marginTop: '20px', marginBottom: '-20px'}}>
      <span style={{float: 'left'}}>{labels[0]}</span>
      <span style={{float: 'right'}}>{labels[1]}</span>
      <div style={{clear: 'both'}}></div>
      <Slider value={preferences.get(id)} onChange={(e, v) => updatePreference(id, v)} />
    </div>
  );
}

function buildImportance(preferences, id) {
  return (
    <div style={{marginTop: '20px', marginBottom: '-20px'}}>
      <span style={{float: 'left'}}>Not Important</span>
      <span style={{float: 'right'}}>Important</span>
      <div style={{clear: 'both'}}></div>
      <Slider value={preferences.get(`${id}Importance`)} step={0.2} onChange={(e, v) => updatePreference(`${id}Importance`, v)} />
    </div>
  );
}

function buildRow(row, preferences) {
  return (
    <TableRow key={`pref-${row.name}`}>
      <TableRowColumn>{row.name}</TableRowColumn>
      <TableRowColumn>{buildSlider(preferences, row.id)}</TableRowColumn>
      <TableRowColumn>{buildImportance(preferences, row.id)}</TableRowColumn>
    </TableRow>
  );
}

const basics = [
  {name: 'Weight', id: 'weight'},
  {name: 'Height', id: 'height'},
  {name: 'Popularity', id: 'popularity'}
];

const activity = [
  {name: 'Activity', id: 'activity_minutes'},
  {name: 'Energy Level', id: 'energy_level'},
  {name: 'Walks Needed', id: 'walk_miles'}
];

const grooming = [
  {name: 'Shedding', id: 'shedding'},
  {name: 'Coat Length', id: 'coat_length'},
  {name: 'Grooming Frequency', id: 'grooming_frequency'}
];

const costs = [
  {name: 'Monthly Food Cost', id: 'food_monthly_cost'},
  {name: 'Lifespan', id: 'lifespan'},
  {name: 'Health', id: 'health'}
];

const behavior = [
  {name: 'Train-ability', id: 'trainability'},
  {name: 'Temperament', id: 'temperament'}
];

const headerStyle = {fontSize: '20px', paddingBottom: '20px'};

function buildPrefs(name, prefs, expanded) {
  return (
    <AccordionItem expanded={expanded} key={`prefs-${name}`}>
      <AccordionItemTitle>{name}</AccordionItemTitle>
      <AccordionItemBody>
        <Table selectable={false}>
          <TableHeader displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn></TableHeaderColumn>
              <TableHeaderColumn style={headerStyle}>Preference</TableHeaderColumn>
              <TableHeaderColumn style={headerStyle}>Importance</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {prefs}
          </TableBody>
        </Table>
      </AccordionItemBody>
    </AccordionItem>
  );
}

const allPrefs = [
  {name: 'Basic', props: basics},
  {name: 'Activity', props: activity},
  {name: 'Grooming', props: grooming},
  {name: 'Costs', props: costs},
  {name: 'Behavior', props: behavior}
];

class Preferences extends React.Component {

  state = {
    open: 0
  }

  submit = () => {
    const { history, preferences, search } = this.props;
    requestMoreBreeds(search, preferences, true);
    history.push('/breeds');
  }

  keypress = (e) => {
    if (e.keyCode === 13) this.submit();
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keypress);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keypress);
  }

  render() {
    const { preferences } = this.props;
    const { open } = this.state;

    return (
      <div id='preferences'>
        <Accordion onChange={(i) => this.setState({open: i})}>
          {allPrefs.map((obj, i) => buildPrefs(obj.name, obj.props.map(p => buildRow(p, preferences)), open === i))}
        </Accordion>
        <RaisedButton secondary={true} onClick={this.submit}>Submit</RaisedButton>
      </div>
    );
  }
}


export default connect(mapStateToProps)(withRouter(Preferences));
