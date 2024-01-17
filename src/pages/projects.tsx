import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  // SelectionMode,
  useEdgesState,
  useNodesState,
  // applyNodeChanges,
  // applyEdgeChanges,
  Node,
  Edge,
  // NodeChange,
  // EdgeChange,
  Connection,
  FitViewOptions,
  DefaultEdgeOptions,
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
} from 'reactflow';

import { saveAs } from 'file-saver';

import Box from "@mui/material/Box";
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import "./projects.css";

// TODO: add babel-plugin-root-import
import { APIGateway, APIGatewayData } from '../components/flow/APIGateway';
import { FrontEnd, FrontEndData } from '../components/flow/FrontEnd';
import { Database, DatabaseData } from '../components/flow/Database';

import { HiddenInput } from '../components/HiddenInput/HiddenInput';

export type InputFlowData = {
  nodes: Node<APIGatewayData|FrontEndData|DatabaseData>[],
  edges: Edge[],
}

export type ProjectsProps = {
  data: InputFlowData,
}


const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const nodeTypes: NodeTypes = {
  apigateway: APIGateway,
  frontend: FrontEnd,
  database: Database,
};

export function Projects({ data }: ProjectsProps) {
  const [ drawerState, setDrawerState ] = useState<boolean>(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const closeDrawer = useCallback(() => setDrawerState(false), [setDrawerState]);

  return (
    <div className="page-projects">
      <MenuIcon
        className="menu clickable"
        onClick={openDrawer}
      />
      <Drawer
        className="drawer"
        anchor="left"
        open={drawerState}
        hideBackdrop={true}
        disablePortal={true}
      >
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
        It should be ribbon tabs with `Components` and `Edges`
    </Box>
      </Drawer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
      >
        <Background
          variant={BackgroundVariant.Lines}
          lineWidth={2}
        />
        <Controls
          position='bottom-right'
        />
      </ReactFlow>
    </div>
  )
}
