import React from 'react';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Rating } from 'material-ui-rating';

import { formatText } from 'infra/utils';
import { preferenceLabels } from 'infra/const';

const headerStyle = {fontSize: '20px', paddingBottom: '20px'};

function buildScaled(value, name) {
  const labels = preferenceLabels[name];
  return (
    <div>
      <span style={{display: 'inline-block', width: 85, verticalAlign: 8}}>{labels[0]}</span>
      <Rating
        style={{display: 'inline'}}
        iconFilled={<img src='/static/img/filled.png' height={20} />}
        iconNormal={<img src='/static/img/unfilled.png' height={20} />}
        value={value*5} max={5} readOnly={true}
      />
      <span style={{marginLeft: 30, verticalAlign: 6}}>{labels[1]}</span>
    </div>
  );
}

function Contribution(value) {
  const scaled = 'scaled';

  const numberNode = <div style={{textAlign: 'center'}}>{Math.round(value.value)} {formatText(value.units)}</div>;
  const scaledNode = buildScaled(value.value, value.name);
  return (
    <TableRow key={`contrib-${value.name}`}>
      <TableRowColumn style={{width: '25%'}}>{formatText(value.name)}</TableRowColumn>
      <TableRowColumn>{value.units === scaled ? scaledNode : numberNode}</TableRowColumn>
    </TableRow>
  );
}

export default function Contributions({ values }) {
  return (
    <Table selectable={false}>
      <TableBody displayRowCheckbox={false}>
        {values.map(Contribution)}
      </TableBody>
    </Table>
  );
}
