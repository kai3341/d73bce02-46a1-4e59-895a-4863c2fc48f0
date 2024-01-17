import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import ApiIcon from '@mui/icons-material/Api';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

import { myFlowComponentAttrs, myFlowComponentAttrsType } from './constants';

export type APIGatewayData = {
  label?: string,
}

export function APIGatewayBody (props: APIGatewayData) {
  const {
    label = "API Gateway",
  } = props;
  return (
    <Card>
      <CardHeader
        avatar={<Avatar><ApiIcon /></Avatar>}
        title={label}
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreVertIcon />
        //   </IconButton>
        // }
      />
  </Card>
  )
}


export function APIGateway(props: NodeProps<APIGatewayData>) {
  return (
    <>
      <APIGatewayBody {...props.data} />
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
      <Handle type="source" position={Position.Bottom} id="private" />
    </>
  )
}

const meta: myFlowComponentAttrsType = {
  key: "apigateway",
  Body: APIGatewayBody,
};

APIGateway[myFlowComponentAttrs] = meta;
