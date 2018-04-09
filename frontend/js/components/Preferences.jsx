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

function buildSlider(preferences, labels, id, step) {
  return (
    <div style={{marginTop: '20px', marginBottom: '-20px'}}>
      <span style={{float: 'left'}}>{labels[0]}</span>
      <span style={{float: 'right'}}>{labels[1]}</span>
      <div style={{clear: 'both'}}></div>
      <Slider value={preferences.get(id)} step={step} onChange={(e, v) => updatePreference(id, v)} />
    </div>
  );
}

function buildToggle(preferences, labels, id) {
  return (
    <div style={{marginTop: '-25px', marginBottom: '-20px'}}>
      <span style={{float: 'left'}}>{labels[0]}</span>
      <span style={{float: 'right'}}>{labels[1]}</span>
      <Toggle style={{margin: 'auto', width: '75px', marginTop: '20px'}} toggled={preferences.get(id)} onToggle={(e, v) => updatePreference(id, v)} />
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

function getBasic(preferences) {
  return [
    {name: 'Activity Level', component: buildSlider(preferences, ['Inactive', 'Very Active'], 'activityLevel'), importance: buildImportance(preferences, 'activityLevel')},
    {name: 'Price', component: buildSlider(preferences, ['Cheap', 'Expensive'], 'price'), importance: buildImportance(preferences, 'price')},
    {name: 'Shedding', component: buildSlider(preferences, ['Doesn\'t Shed', 'Sheds Often'], 'shedding'), importance: buildImportance(preferences, 'shedding')},
    {name: 'Dog Size', component: buildSlider(preferences, ['Tiny', 'Huge'], 'dogSize'), importance: buildImportance(preferences, 'dogSize')},
    {name: 'Barking', component: buildSlider(preferences, ['Rarely Barks', 'Loud'], 'barking'), importance: buildImportance(preferences, 'barking')},
    {name: 'Lifespan', component: buildSlider(preferences, ['Short', 'Long'], 'lifespan'), importance: buildImportance(preferences, 'lifespan')},
    {name: 'Space Requirement', component: buildSlider(preferences, ['Apartment dog', 'Needs Backyard'], 'spaceRequirement', 0.33), importance: buildImportance(preferences, 'spaceRequirement')},
    {name: 'Hair Length', component: buildSlider(preferences, ['Short', 'Long'], 'hairLength'), importance: buildImportance(preferences, 'hairLength')},
    {name: 'Hypoallergenic', component: buildToggle(preferences, ['Non-Hypoallergenic', 'Hypoallergenic'], 'hypoAllergenic'), importance: buildImportance(preferences, 'hypoAllergenic')}
  ];
}

function getBehavior(preferences) {
  return [
    {name: 'Good With Pets', component: buildToggle(preferences, ['Not good with pets', 'Great with other pets'], 'goodWithPets'), importance: buildImportance(preferences, 'goodWithPets')},
    {name: 'Good With Children', component: buildToggle(preferences, ['Not good with kids', 'Great with kids'], 'goodWithChildren'), importance: buildImportance(preferences, 'goodWithChildren')},
    {name: 'Train-ability', component: buildSlider(preferences, ['Easy to train', 'Stubborn'], 'trainability'), importance: buildImportance(preferences, 'trainability')},
    {name: 'Temperament', component: buildSlider(preferences, ['Aggressive', 'Calm'], 'temperament'), importance: buildImportance(preferences, 'temperament')}
  ];
}

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
            {prefs.map(p =>
              <TableRow key={`pref-${p.name}`}>
                <TableRowColumn>{p.name}</TableRowColumn>
                <TableRowColumn>{p.component}</TableRowColumn>
                <TableRowColumn>{p.importance}</TableRowColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AccordionItemBody>
    </AccordionItem>
  );
}

const allPrefs = [
  {name: 'Basic', func: getBasic},
  {name: 'Behavior', func: getBehavior}
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
          {allPrefs.map((obj, i) => buildPrefs(obj.name, obj.func(preferences), open === i + 1))}
        </Accordion>
        <RaisedButton secondary={true} onClick={this.submit}>Submit</RaisedButton>
      </div>
    );
  }
}


export default connect(mapStateToProps)(withRouter(Preferences));
