import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Accordion, AccordionItem, AccordionItemTitle, AccordionItemBody } from 'react-accessible-accordion';

import { updatePreference } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ preferences }) {
  return { preferences };
}

function buildSlider(preferences, labels, id) {
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
      <TableRowColumn>{buildSlider(preferences, row.labels, row.id)}</TableRowColumn>
      <TableRowColumn>{buildImportance(preferences, row.id)}</TableRowColumn>
    </TableRow>
  );
}

const basics = [
  {name: 'Weight', id: 'weight', labels: ['Small', 'Big']},
  {name: 'Height', id: 'height', labels: ['Short', 'Tall']},
  {name: 'Popularity', id: 'popularity', labels: ['Unpopular', 'Popular']}
];

const activity = [
  {name: 'Activity', id: 'activity_minutes', labels: ['Inactive', 'Active']},
  {name: 'Energy Level', id: 'energy_level', labels: ['Low Energy', 'High Energy']},
  {name: 'Walks Needed', id: 'walk_miles', labels: ['Rarely', 'Often']}
];

const grooming = [
  {name: 'Shedding', id: 'shedding', labels: ['Doesn\'t Shed', 'Sheds Often']},
  {name: 'Coat Length', id: 'coat_length', labels: ['Short', 'Long']},
  {name: 'Grooming Frequency', id: 'grooming_frequency', labels: ['Infrequently', 'Frequently']}
];

const costs = [
  {name: 'Monthly Food Cost', id: 'food_monthly_cost', labels: ['Cheap', 'Expensive']},
  {name: 'Lifespan', id: 'lifespan', labels: ['Short', 'Long']},
  {name: 'Health', id: 'health', labels: ['Unhealthy', 'Healthy']}
];

const behavior = [
  {name: 'Train-ability', id: 'trainability', labels: ['Stubborn', 'Easy to Train']},
  {name: 'Temperament', id: 'temperament', labels: ['Calm', 'Excited']}
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
    open: 1
  }

  submit = () => {
    const { history, preferences } = this.props;
    requestMoreBreeds(preferences, true);
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
          <AccordionItem expanded={open === 0} key="prefs-search">
            <AccordionItemTitle>Search</AccordionItemTitle>
            <AccordionItemBody>
              <TextField value={preferences.keywords} floatingLabelText="Search" onChange={(e, v) => updatePreference('keywords', v)} />
            </AccordionItemBody>
          </AccordionItem>
          {allPrefs.map((obj, i) => buildPrefs(obj.name, obj.props.map(p => buildRow(p, preferences)), open === i + 1))}
        </Accordion>
        <RaisedButton secondary={true} onClick={this.submit}>Submit</RaisedButton>
      </div>
    );
  }
}


export default connect(mapStateToProps)(withRouter(Preferences));
