import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import WebIcon from '@mui/icons-material/Web';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

export type FrontEndData = {
//   label: string,
}

export function FrontEnd(props: NodeProps<FrontEndData>) {
  return (
    <>
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
      <Handle type="source" position={Position.Right} id="b" />
    </>
  )
}
