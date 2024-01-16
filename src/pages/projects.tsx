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

import Box from "@mui/material/Box";
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import "./projects.css";

// TODO: add babel-plugin-root-import
import { APIGateway, APIGatewayData } from '../components/flow/APIGateway';
import { FrontEnd, FrontEndData } from '../components/flow/FrontEnd';
import { Database, DatabaseData } from '../components/flow/Database';


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
  // eslint-disable-next-line
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
    <Box
      sx={{ width: 250 }}
      className="page-projects-drawer-content"
    >
      <CloseIcon
        className="close clickable"
        onClick={closeDrawer}
      />
      It should be ribbon tabs with: `File`, `Components` and `Edges`
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
