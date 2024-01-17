import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import WebIcon from '@mui/icons-material/Web';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

import { myFlowComponentAttrs ,myFlowComponentAttrsType } from './constants';

export type FrontEndData = {
//   label: string,
}

export function FrontEndBody(props: FrontEndData) {
  return (
    <Card>
      <CardHeader
        avatar={<Avatar><WebIcon /></Avatar>}
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreVertIcon />
        //   </IconButton>
        // }
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

const meta: myFlowComponentAttrsType = {
  key: "frontend",
  Body: FrontEndBody,
}

FrontEnd[myFlowComponentAttrs] = meta;
