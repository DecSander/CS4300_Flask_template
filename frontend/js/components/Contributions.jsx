import React from 'react';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Rating } from 'material-ui-rating';

import { formatText } from 'infra/utils';

const headerStyle = {fontSize: '20px', paddingBottom: '20px'};

function buildScaled(value) {
  return <Rating
    iconFilled={<img src='/static/img/filled.png' height={20} />}
    iconNormal={<img src='/static/img/unfilled.png' height={20} />}
    value={value*5} max={5} readOnly={true}
  />
}

function Contribution(value) {
  const scaled = 'scaled';
  const v = value.units === scaled ? buildScaled(value.value) : Math.round(value.value);
  const units = value.units === scaled ? null : formatText(value.units);
  return (
    <TableRow key={`contrib-${value.name}`}>
      <TableRowColumn style={{width: '25%'}}>{formatText(value.name)}</TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>{v} {units}</TableRowColumn>
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
