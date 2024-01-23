import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import WebIcon from '@mui/icons-material/Web';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

import { myFlowComponentAttrs } from '../constants';
import { MyFlowComponentAttrsType } from '../types';

export type FrontEndData = {
//   label: string,
}

export function FrontEndBody(props: FrontEndData) {
  return (
    <Card>
      <CardHeader
        avatar={<Avatar><WebIcon /></Avatar>}
      />
    </Card>
  )
}

export function FrontEnd(props: NodeProps<FrontEndData>) {
  return (
    <>
      <FrontEndBody {...props.data} />
      <Handle type="source" position={Position.Right} id="b" />
    </>
  )
}

const meta: MyFlowComponentAttrsType = {
  key: "frontend",
  Body: FrontEndBody,
}

FrontEnd[myFlowComponentAttrs] = meta;
