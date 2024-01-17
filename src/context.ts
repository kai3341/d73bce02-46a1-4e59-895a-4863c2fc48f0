import { createContext } from "react";
import { useNodesState, useEdgesState } from "reactflow";

import { FlowNodesData } from "./components/flow";

// Temporary unused

const dummy = () => {};

// ===

type UseNodesStateReturning<T> = ReturnType<typeof useNodesState<T>>;

export type NodesContextType<T> = {
  nodes: UseNodesStateReturning<T>[0],
  setNodes: UseNodesStateReturning<T>[1],
  onNodesChange: UseNodesStateReturning<T>[2],
};

export const NodesContextDefault = {
  nodes: [],
  setNodes: dummy,
  onNodesChange: dummy,
}

export const NodesContext = createContext<NodesContextType<FlowNodesData>>(NodesContextDefault);

// ===

type UseEdgesStateReturning<T> = ReturnType<typeof useEdgesState<T>>;

export type EdgesContextType<T> = {
  edges: UseEdgesStateReturning<T>[0],
  setEdges: UseEdgesStateReturning<T>[1],
  onEdgesChange: UseEdgesStateReturning<T>[2],
};

export const EdgesContextDefault = {
  edges: [],
  setEdges: dummy,
  onEdgesChange: dummy,
}


export const EdgesContext = createContext<EdgesContextType<FlowNodesData>>(EdgesContextDefault);
