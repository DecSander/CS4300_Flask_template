import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';

import { updatePreference } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ preferences }) {
  return { preferences };
}

function buildSlider(preferences, id, step) {
  return <Slider value={preferences.get(id)} step={step} onChange={(e, v) => updatePreference(id, v)} />;
}

function buildToggle(preferences, id) {
  return <Toggle toggled={preferences.get(id)} onToggle={(e, v) => updatePreference(id, v)} />;
}

function buildImportance(preferences, id) {
  return <Slider value={preferences.get(`${id}Importance`)} step={0.2} onChange={(e, v) => updatePreference(`${id}Importance`, v)} />;
}

function getBasic(preferences) {
  return [
    {name: 'Activity Level', component: buildSlider(preferences, 'activityLevel'), importance: buildImportance(preferences, 'activityLevel')},
    {name: 'Price', component: buildSlider(preferences, 'price'), importance: buildImportance(preferences, 'price')},
    {name: 'Shedding', component: buildSlider(preferences, 'shedding'), importance: buildImportance(preferences, 'shedding')},
    {name: 'Dog Size', component: buildSlider(preferences, 'dogSize'), importance: buildImportance(preferences, 'dogSize')},
    {name: 'Barking', component: buildSlider(preferences, 'barking'), importance: buildImportance(preferences, 'barking')},
    {name: 'Lifespan', component: buildSlider(preferences, 'lifespan'), importance: buildImportance(preferences, 'lifespan')},
    {name: 'Space Requirement', component: buildSlider(preferences, 'spaceRequirement', 0.33), importance: buildImportance(preferences, 'spaceRequirement')},
    {name: 'Hair Length', component: buildSlider(preferences, 'hairLength'), importance: buildImportance(preferences, 'hairLength')},
    {name: 'Hypoallergenic', component: buildToggle(preferences, 'hypoAllergenic'), importance: buildImportance(preferences, 'hypoAllergenic')}
  ];
}

function getBehavior(preferences) {
  return [
    {name: 'Good With Pets', component: buildToggle(preferences, 'goodWithPets'), importance: buildImportance(preferences, 'goodWithPets')},
    {name: 'Good With Children', component: buildToggle(preferences, 'goodWithChildren'), importance: buildImportance(preferences, 'goodWithChildren')},
    {name: 'Train-ability', component: buildSlider(preferences, 'trainability'), importance: buildImportance(preferences, 'trainability')},
    {name: 'Temperament', component: buildSlider(preferences, 'temperament'), importance: buildImportance(preferences, 'temperament')}
  ];
}

function buildPrefs(name, prefs, expanded) {
  return (
    <AccordionItem expanded={expanded} key={`prefs-${name}`}>
      <AccordionItemTitle>{name}</AccordionItemTitle>
      <AccordionItemBody>
        {prefs.map(p =>
          <Table><TableBody displayRowCheckbox={false}><TableRow>
            <TableRowColumn>{p.name}</TableRowColumn>
            <TableRowColumn>{p.component}</TableRowColumn>
            <TableRowColumn>{p.importance}</TableRowColumn>
          </TableRow></TableBody></Table>
        )}
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

  render() {
    const { preferences, history } = this.props;
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
        <RaisedButton secondary={true} onClick={() => { requestMoreBreeds(preferences); history.push('/breeds'); }}>Submit</RaisedButton>
      </div>
    );
  }
}


export default connect(mapStateToProps)(withRouter(Preferences));
