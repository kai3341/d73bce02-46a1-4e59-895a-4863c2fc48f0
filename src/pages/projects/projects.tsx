import React, { useCallback, useState } from "react";

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
} from "reactflow";

import { useWMState } from "@wrap-mutant/react";

import Drawer from "@mui/material/Drawer";

import MenuIcon from "@mui/icons-material/Menu";

import "./projects.css";

import {
  myFlowComponentAttrs,
  dataTransferKey,
  drogDropEffectName,
  group,
} from "~/components/flow";

import { SideMenu } from "~/blocks/side-menu";
import { StateMGR, WrappedEdges } from "~/lib/statemgr";

import { defaultConfigBodyFactory } from "~/lib/migrator";
import {
  applyEdgeChanges,
  applyNodeChanges,
} from "~/lib/reactflow-changes-mutable";

export type ProjectsProps = {
  //
};

export type ProjectsInnerProps = {
  //
};

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

const stateMGRFactory = () => new StateMGR(defaultConfigBodyFactory());

export function ProjectsInner(props: ProjectsInnerProps) {
  const [drawerState, setDrawerState] = useState(true);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { getIntersectingNodes } = useReactFlow();

  const [statemgr, updateStatemgr] = useWMState(stateMGRFactory);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nodes = statemgr.nodes;
      statemgr.nodes = applyNodeChanges(changes, nodes);
      updateStatemgr();
    },
    [statemgr, updateStatemgr],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const edges = statemgr.edges;
      statemgr.edges = applyEdgeChanges(changes, edges);
      updateStatemgr();
    },
    [statemgr, updateStatemgr],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edges = statemgr.edges;
      statemgr.edges = addEdge(connection, edges) as WrappedEdges;
      updateStatemgr();
    },
    [statemgr, updateStatemgr],
  );

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const closeDrawer = useCallback(
    () => setDrawerState(false),
    [setDrawerState],
  );

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

      const newNode: Node = {
        id: newNodeID,
        type,
        position,
        data: {},
        ...meta.defaultProps,
      };

      const nodes = statemgr.nodes;
      nodes.insort(newNode);
      statemgr.nodes = nodes;
      statemgr.onNodeAdd(newNode);

      updateStatemgr();
    },
    [reactFlowInstance, statemgr, updateStatemgr],
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, draggedNode: Node) => {
      if (draggedNode.parentNode) return;

      const intersections = getIntersectingNodes(draggedNode);

      if (!intersections.length) return;

      // last intersection is the deepest nested node
      intersections.reverse();

      const intersectedIDs = new Set(intersections.map((n) => n.id));

      let firstGroup: Node | null = null;

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
      const draggedNodeIDX = nodes.findIndex(
        (node) => node.id === draggedNodeID,
      );
      nodes.splice(draggedNodeIDX, 1);
      // const newNodes = [...nodes];
      const position = { ...draggedNode.position };
      const firstGropuPosition = firstGroup.position;

      position.x -= firstGropuPosition.x;
      position.y -= firstGropuPosition.y;

      if (position.x < 0) position.x = 0;
      if (position.y < 0) position.y = 0;

      if (firstGroup.width && position.x > firstGroup.width)
        position.x = firstGroup.width;
      if (firstGroup.height && position.y > firstGroup.height)
        position.y = firstGroup.height;

      const newNode: Node = {
        ...draggedNode,
        parentNode: firstGroup.id,
        extent: "parent",
        position,
      };

      nodes.insort(newNode);

      statemgr.nodes = nodes;
      updateStatemgr();
    },
    [statemgr, updateStatemgr, getIntersectingNodes],
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      statemgr.onNodeDoubleClick(event, node);
      updateStatemgr();
    },
    [statemgr, updateStatemgr],
  );

  return (
    <div className="page-projects">
      <MenuIcon className="menu clickable" onClick={openDrawer} />
      <Drawer
        className="drawer"
        anchor="left"
        open={drawerState}
        hideBackdrop={true}
        disablePortal={true}
      >
        <SideMenu
          statemgr={statemgr}
          updateStatemgr={updateStatemgr}
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
        onNodeDoubleClick={onNodeDoubleClick}
      >
        <Background variant={BackgroundVariant.Lines} lineWidth={2} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
}

export function Projects(props: ProjectsProps) {
  return (
    <ReactFlowProvider>
      <ProjectsInner />
    </ReactFlowProvider>
  );
}
