import React from 'react';
import TextField from 'material-ui/TextField';
import { connect } from 'react-redux';

import { updatePreference } from 'infra/GlobalActions';

function mapStateToProps({ preferences }) {
  return { preferences };
}

function Preferences({ preferences }) {
  const { keywords } = preferences;
  return (
    <div id='preferences'>
      <TextField value={keywords} floatingLabelText="Keywords" onChange={(e, v) => updatePreference('keywords', v)} />
    </div>
  );
}

export default connect(mapStateToProps)(Preferences);
