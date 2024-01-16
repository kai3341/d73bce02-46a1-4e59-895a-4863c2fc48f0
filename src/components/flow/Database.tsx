import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import StorageIcon from '@mui/icons-material/Storage';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

export type DatabaseData = {
  label: string,
}

export function Database(props: NodeProps<DatabaseData>) {
  return (
    <>
      <Card>
        <CardHeader
          avatar={<Avatar><StorageIcon /></Avatar>}
          title={props.data.label}
          // action={
          //   <IconButton aria-label="settings">
          //     <MoreVertIcon />
          //   </IconButton>
          // }
        />
      </Card>
      <Handle type="target" position={Position.Top} id="a" />
    </>
  )
}
