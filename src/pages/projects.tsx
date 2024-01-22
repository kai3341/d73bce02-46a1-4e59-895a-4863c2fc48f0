import React, {
  useCallback,
  useState,
} from 'react';

import ReactFlow, {
  ReactFlowProvider,
  ReactFlowInstance,
  addEdge,
  useReactFlow,
  Node,
  Connection,
  FitViewOptions,
  DefaultEdgeOptions,
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
  // NodeProps,
  NodeChange,
  EdgeChange,
} from 'reactflow';

import { wrapCached, toggleCached, HasWrapperGen } from 'wrap-mutant/dist/caching';

import Drawer from '@mui/material/Drawer';

import MenuIcon from '@mui/icons-material/Menu';

import "./projects.css";

import {
  // FlowNodes,
  myFlowComponentAttrs,
  // FlowNodeTypeMap,
  dataTransferKey,
  drogDropEffectName,
  group,
} from '~/components/flow';

import { SideMenu } from "~/blocks/side-menu";
import { StateMGR, WrappedEdges } from './statemgr';

import { defaultConfigBodyFactory } from './migrator';
import { applyEdgeChanges, applyNodeChanges } from './reactflow-changes-mutable';

export type ProjectsProps = {
  //
}

type WrappedStateMGR = HasWrapperGen<StateMGR>;

export type ProjectsInnerProps = {
  statemgr: WrappedStateMGR,
}


const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};


// No dependensies => move outside the component
const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = drogDropEffectName;
};


export function ProjectsInner(props: ProjectsInnerProps) {
  const [ drawerState, setDrawerState ] = useState<boolean>(true);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance|null>(null);
  const { getIntersectingNodes } = useReactFlow();

  const [ statemgr, setStatemgr ] = useState(props.statemgr);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nodes = statemgr.nodes;
      statemgr.nodes = applyNodeChanges(changes, nodes);
      setStatemgr(toggleCached(statemgr));
    },
    [statemgr, setStatemgr],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const edges = statemgr.edges;
      statemgr.edges = applyEdgeChanges(changes, edges);
      setStatemgr(toggleCached(statemgr));
    },
    [statemgr, setStatemgr],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edges = statemgr.edges;
      statemgr.edges = addEdge(connection, edges) as WrappedEdges;
      setStatemgr(toggleCached(statemgr));
    },
    [statemgr, setStatemgr],
  );

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const closeDrawer = useCallback(() => setDrawerState(false), [setDrawerState]);


  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (reactFlowInstance === null) return;

      event.preventDefault();

      const type = event.dataTransfer.getData(dataTransferKey);

      // It looks type is never undefined, so check is redundant
      if (type === undefined || !type) return;

      const nodeElement = statemgr.nodeTypes[type];
      const meta = nodeElement[myFlowComponentAttrs];

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeID = statemgr.nextNodeID();

      const newNode = ({
        id: newNodeID,
        type,
        position,
        data: {},
        ...meta.defaultProps,
      });

      const nodes = statemgr.nodes;
      nodes.insort(newNode);
      statemgr.nodes = nodes;

      setStatemgr(toggleCached(statemgr));
    },
    [ reactFlowInstance, statemgr, setStatemgr ],
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, draggedNode: Node) => {
      if (draggedNode.parentNode) return;

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

      if (firstGroup.parentNode) return;

      const nodes = statemgr.nodes;
      const draggedNodeID = draggedNode.id;
      const draggedNodeIDX = nodes.findIndex(node => node.id === draggedNodeID);
      nodes.splice(draggedNodeIDX, 1);
      // const newNodes = [...nodes];
      const position = {...draggedNode.position};
      const firstGropuPosition = firstGroup.position;

      position.x -= firstGropuPosition.x;
      position.y -= firstGropuPosition.y;

      if(position.x < 0) position.x = 0;
      if(position.y < 0) position.y = 0;

      if(firstGroup.width && position.x > firstGroup.width) position.x = firstGroup.width;
      if(firstGroup.height && position.y > firstGroup.height) position.y = firstGroup.height;

      nodes.insort({
        ...draggedNode,
        parentNode: firstGroup.id,
        extent: "parent",
        position,
      });


      // nodes[draggedNodeIDX] = {
      //   ...draggedNode,
      //   parentNode: firstGroup.id,
      //   extent: "parent",
      //   position,
      // };

      statemgr.nodes = nodes;
      setStatemgr(toggleCached(statemgr));

    //   const nodeSorter = new NodeSorter(nodes);
    //   if (nodeSorter.isParent(draggedNode, firstGroup)) return;
    //   if (nodeSorter.isParent(firstGroup, draggedNode)) return;

    //   setNodes((nodes) => {
    //     const firstGroup_ = firstGroup as Node;
    //     const draggedNodeID = draggedNode.id;
    //     const draggedNodeIDX = nodes.findIndex(node => node.id === draggedNodeID);
    //     const newNodes = [...nodes];
    //     const position = {...draggedNode.position};
    //     const firstGropuPosition = firstGroup_.position;

    //     position.x -= firstGropuPosition.x;
    //     position.y -= firstGropuPosition.y;

    //     if(position.x < 0) position.x = 0;
    //     if(position.y < 0) position.y = 0;

    //     if(firstGroup_.width && position.x > firstGroup_.width) position.x = firstGroup_.width;
    //     if(firstGroup_.height && position.y > firstGroup_.height) position.y = firstGroup_.height;

    //     newNodes[draggedNodeIDX] = {
    //       ...draggedNode,
    //       parentNode: firstGroup_.id,
    //       extent: "parent",
    //       position,
    //     };

    //     NodeSorter.sort(newNodes);

    //     return newNodes;
    //   })
    },
    [statemgr, setStatemgr, getIntersectingNodes],
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
          statemgr={statemgr}
          setStatemgr={setStatemgr}
          closeDrawer={closeDrawer}
        />
      </Drawer>
      <ReactFlow
        nodes={statemgr.nodes}
        edges={statemgr.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={statemgr.nodeTypes as NodeTypes}
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
  // eslint-disable-next-line
  const [ statemgr, setStatemgr ] = useState(
    wrapCached(new StateMGR(defaultConfigBodyFactory()))
  )
  return (
    <ReactFlowProvider>
      <ProjectsInner statemgr={statemgr} />
    </ReactFlowProvider>
  )
}
