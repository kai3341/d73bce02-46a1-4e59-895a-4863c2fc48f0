import React, {
  useCallback,
  useState,
} from 'react';

import ReactFlow, {
  ReactFlowProvider,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Node,
  Edge,
  Connection,
  FitViewOptions,
  DefaultEdgeOptions,
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
  NodeProps,
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
import {
  FlowNodes,
  FlowNodesData,
  myFlowComponentAttrs,
  myFlowComponentAttrsType,
  FlowNodeTypeMap,
} from '~/components/flow';

import { HiddenInput } from '~/components/HiddenInput/HiddenInput';

import { NodeSorter } from '~/NodeSorter';


export type InputFlowData = {
  nodes: Node<FlowNodesData>[],
  edges: Edge[],
}

export type ProjectsProps = {
  data?: InputFlowData,
}


const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};


const flowNodeTypes: FlowNodeTypeMap<NodeProps> = {};

FlowNodes.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  flowNodeTypes[meta.key] = item;
})

const nodeTypes = flowNodeTypes as NodeTypes;

const dataTransferKey = 'application/reactflow';
const drogDropEffectName = 'move';
const group = "group";

// No dependensies => move outside the component
const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = drogDropEffectName;
};

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

export function ProjectsInner({
  data = { nodes: [], edges: []},
}: ProjectsProps) {
  const [ drawerState, setDrawerState ] = useState<boolean>(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance|null>(null);
  const [ nodeID, setNodeID ] = useState<number>(1);
  const { getIntersectingNodes } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const closeDrawer = useCallback(() => setDrawerState(false), [setDrawerState]);

  const nextNodeID = () => {
    setNodeID(nodeID+1);
    return nodeID.toString();
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (reactFlowInstance === null) return;

    event.preventDefault();

    const type = event.dataTransfer.getData(dataTransferKey);

    // It looks type is never undefined, so check is redundant
    if (type === undefined || !type) return;

    const nodeElement = flowNodeTypes[type];
    const meta = nodeElement[myFlowComponentAttrs] as myFlowComponentAttrsType;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNodeID = nextNodeID();

    const newNode = {
      id: newNodeID,
      type,
      position,
      data: {},
      ...meta.defaultProps,
    };  

    setNodes((nodes) => {
      const newNodes = nodes.concat(newNode);
      if (type === group) NodeSorter.sort(newNodes);
      return newNodes;
    });
  };

  const onNodeDragStop = useCallback((event: React.MouseEvent<Element, MouseEvent>, draggedNode: Node, nodes: Node[]) => {
    const intersections = getIntersectingNodes(draggedNode);

    if (!intersections.length) return;

    // last intersection is the deepest nested node
    intersections.reverse();

    const intersectedIDs = new Set(intersections.map(n => n.id));

    let firstGroup: Node|null = null;

    for (const node of intersections) {
      const nodeID = node.id;
      if (intersectedIDs.has(nodeID) && node.type === group) {
        firstGroup = node;
        break;
      }
    }

    if (firstGroup === null) return;

    const nodeSorter = new NodeSorter(nodes);
    if (nodeSorter.isParent(draggedNode, firstGroup)) return;
    if (nodeSorter.isParent(firstGroup, draggedNode)) return;

    setNodes((nodes) => {
      const firstGroup_ = firstGroup as Node;
      const draggedNodeID = draggedNode.id;
      const draggedNodeIDX = nodes.findIndex(node => node.id === draggedNodeID);
      const newNodes = [...nodes];
      const position = {...draggedNode.position};
      const firstGropuPosition = firstGroup_.position;

      position.x -= firstGropuPosition.x;
      position.y -= firstGropuPosition.y;

      if(position.x < 0) position.x = 0;
      if(position.y < 0) position.y = 0;

      if(firstGroup_.width && position.x > firstGroup_.width) position.x = firstGroup_.width;
      if(firstGroup_.height && position.y > firstGroup_.height) position.y = firstGroup_.height;

      newNodes[draggedNodeIDX] = {
        ...draggedNode,
        parentNode: firstGroup_.id,
        extent: "parent",
        position,
      };

      NodeSorter.sort(newNodes);

      return newNodes;
    })
    },
    [getIntersectingNodes, setNodes],
  );


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
        <Box className="page-projects-drawer-content-components">
          {renderedFlowNodes}
        </Box>
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
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
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

export function Projects(props: ProjectsProps) {
  return (
    <ReactFlowProvider>
      <ProjectsInner {...props} />
    </ReactFlowProvider>
  )
}
