import React from 'react';
import { Node, Edge } from 'reactflow';

import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { saveAs } from 'file-saver';

import { HiddenInput } from '~/components/HiddenInput/HiddenInput';

import {
  FlowNodes,
  myFlowComponentAttrs,
  dataTransferKey,
  drogDropEffectName,
} from '~/components/flow';


export type InputFlowData = {
  nodes: Node[],
  edges: Edge[],
}

const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
  event.dataTransfer.setData(dataTransferKey, nodeType);
  event.dataTransfer.effectAllowed = drogDropEffectName;
};


const renderedFlowNodes = FlowNodes.map((node) => {
  const meta = node[myFlowComponentAttrs];
  const { key, Body } = meta;
  return (
    <div
      className="react-flow__node"
      key={key}
      onDragStart={(event) => onDragStart(event, key)}
      draggable="true"
    >
      <Body />
    </div>
  )
})

type FlowSetterFn<T> = (arg0: T) => T
type FlowSetter<T> = (arg0: T[]|FlowSetterFn<T[]>) => void;

export type SideMenuProps = {
  nodes: Node[],
  setNodes: FlowSetter<Node>,
  edges: Edge[],
  setEdges: FlowSetter<Edge>,
  closeDrawer: () => void,
}

export function SideMenu({
  nodes,
  setNodes,
  edges,
  setEdges,
  closeDrawer,
}: SideMenuProps) {
  return (
    <Box className="page-projects-drawer-content">
      <Box className="page-projects-drawer-content-controls">
        <Box>
          <IconButton component="label">
            <HiddenInput type="file" onChange={async (event) => {
              const { files } = event.target;
              if (files === null) return;
              // FIXME: handle multiple files (?)
              const file = files[0];
              // FIXME: handle invalid files
              const uploadData = await file.text();
              const uploadJSON = JSON.parse(uploadData) as InputFlowData;
              setNodes(uploadJSON.nodes);
              setEdges(uploadJSON.edges);
            }}>
              <UploadFileIcon/>
            </HiddenInput>
          </IconButton>
          <IconButton
            onClick={() => {
              const saveData = { nodes, edges };
              const saveBlob = new Blob(
                [JSON.stringify(saveData)],
                { type: "application/json;charset=utf-8" },
              );
              // FIXME: filename = project_name + ext
              saveAs(saveBlob, "flowdata.json");
            }}
          >
            <SaveAltIcon />
          </IconButton>
          <IconButton onClick={() => {
            // FIXME: actually we have to open modal and ask does the user sure
            setNodes([]);
            setEdges([]);
          }}>
            <DeleteForeverIcon color="warning" />
          </IconButton>
        </Box>
        <CloseIcon
          className="close clickable"
          onClick={closeDrawer}
        />
      </Box>
        <Box className="page-projects-drawer-content-components">
          {renderedFlowNodes}
        </Box>
    </Box>
  )
}
