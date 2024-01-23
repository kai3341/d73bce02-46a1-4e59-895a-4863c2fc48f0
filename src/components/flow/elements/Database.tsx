import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import StorageIcon from '@mui/icons-material/Storage';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

import { myFlowComponentAttrs } from '../constants';
import { MyFlowComponentAttrsType } from '../types';


export type DatabaseData = {
  label?: string,
}

export function DatabaseBody(props: DatabaseData) {
  const {
    label = "Database",
  } = props;

  return (
    <Card>
      <CardHeader
        avatar={<Avatar><StorageIcon /></Avatar>}
        title={label}
      />
    </Card>
  )
}

export function Database(props: NodeProps<DatabaseData>) {
  return (
    <>
      <DatabaseBody {...props.data} />
      <Handle type="target" position={Position.Top} id="a" />
    </>
  )
}

const meta: MyFlowComponentAttrsType = {
  key: "database",
  Body: DatabaseBody,
  // TODO: add configurer
};

Database[myFlowComponentAttrs] = meta;
