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

import { updatePreference } from 'infra/GlobalActions';
import { requestMoreBreeds } from 'infra/api';

function mapStateToProps({ preferences }) {
  return { preferences };
}

function getPreferences(preferences) {
  return [
    {name: 'Search', component: <TextField value={preferences.keywords} floatingLabelText="Search" onChange={(e, v) => updatePreference('keywords', v)} />},
    {name: 'Activity Level', component: <Slider value={preferences.activityLevel} onChange={(e, v) => updatePreference('activityLevel', v)} />},
    {name: 'Price', component: <Slider value={preferences.price} onChange={(e, v) => updatePreference('price', v)} />},
    {name: 'Shedding', component: <Slider value={preferences.shedding} onChange={(e, v) => updatePreference('shedding', v)} />},
    {name: 'Dog Size', component: <Slider value={preferences.dogSize} onChange={(e, v) => updatePreference('dogSize', v)} />},
    {name: 'Barking', component: <Slider value={preferences.barking} onChange={(e, v) => updatePreference('barking', v)} />},
    {name: 'Lifespan', component: <Slider value={preferences.lifespan} onChange={(e, v) => updatePreference('lifespan', v)} />},
    {name: 'Space Requirement', component: <Slider value={preferences.spaceRequirement} step={0.2} onChange={(e, v) => updatePreference('spaceRequirement', v)} />},
    {name: 'Good With Pets', component: <Toggle value={preferences.goodWithPets} onToggle={(e, v) => updatePreference('goodWithPets', v)} />},
    {name: 'Good With Children', component: <Toggle value={preferences.goodWithChildren} onToggle={(e, v) => updatePreference('goodWithChildren', v)} />},
    {name: 'Train-ability', component: <Slider value={preferences.trainability} onChange={(e, v) => updatePreference('trainability', v)} />},
    {name: 'Hair Length', component: <Slider value={preferences.hairLength} step={0.2} onChange={(e, v) => updatePreference('hairLength', v)} />},
    {name: 'Temperament', component: <Slider value={preferences.temperament} onChange={(e, v) => updatePreference('temperament', v)} />},
    {name: 'Hypoallergenic', component: <Toggle value={preferences.hypoAllergenic} onToggle={(e, v) => updatePreference('hypoAllergenic', v)} />},
  ];
}

function Preferences({ preferences, history }) {
  const pref_fields = getPreferences(preferences);
  return (
    <div id='preferences'>
      <Table>
        <TableBody displayRowCheckbox={false}>
          {pref_fields.map(c => <TableRow><TableRowColumn>{c.name}</TableRowColumn><TableRowColumn>{c.component}</TableRowColumn></TableRow>)}
        </TableBody>
      </Table>
      <RaisedButton secondary={true} onClick={() => { requestMoreBreeds(preferences); history.push('/'); }}>Submit</RaisedButton>
    </div>
  );
}

export default connect(mapStateToProps)(withRouter(Preferences));
