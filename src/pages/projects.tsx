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
  Connection,
  FitViewOptions,
  DefaultEdgeOptions,
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
  NodeProps,
} from 'reactflow';

import Drawer from '@mui/material/Drawer';

import MenuIcon from '@mui/icons-material/Menu';

import "./projects.css";

import {
  FlowNodes,
  myFlowComponentAttrs,
  FlowNodeTypeMap,
  dataTransferKey,
  drogDropEffectName,
  group,
} from '~/components/flow';

import {
  SideMenu,
  InputFlowData,
} from "~/blocks/side-menu";

import { NodeSorter } from '~/NodeSorter';


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

// No dependensies => move outside the component
const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = drogDropEffectName;
};


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

  const nextNodeID = useCallback(
    () => {
      setNodeID(nodeID+1);
      return nodeID.toString();
    },
    [nodeID, setNodeID],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (reactFlowInstance === null) return;

      event.preventDefault();

      const type = event.dataTransfer.getData(dataTransferKey);

      // It looks type is never undefined, so check is redundant
      if (type === undefined || !type) return;

      const nodeElement = flowNodeTypes[type];
      const meta = nodeElement[myFlowComponentAttrs];

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
    },
    [ reactFlowInstance, setNodes, nextNodeID ],
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, draggedNode: Node, nodes: Node[]) => {
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
        <SideMenu
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          closeDrawer={closeDrawer}
        />
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
        <Controls position='bottom-right' />
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
