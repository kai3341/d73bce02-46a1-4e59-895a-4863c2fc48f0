import { Node, Edge, NodeProps } from "reactflow";

import { wrap, toggle, bindCallables, HasWrapperGen } from "@wrap-mutant/react";

import {
  FlowNodesElementsMap,
  FlowNodesCatalogueMap,
  FlowNodesElements,
  FlowNodesCatalogue,
  FlowNodeTypeMap,
  FlowNodeComponent,
} from "~/components/flow";

import { group } from "~/components/flow/constants";
import { ArrayHeapq } from "~/lib/heapq-array";

import {
  View,
  Config,
  ConfigBody,
  FlowData,
  ConfigBodyGeneric,
  FlowDataGeneric,
  configVersion,
  migrator,
  newFlowData,
} from "./migrator";

const indexKey = Symbol();

type Index<T> = Map<string, T>;

type HasInsort<T> = {
  insort: (item: T) => void;
};

type HasIndex<T> = HasInsort<T> & {
  [indexKey]: Index<T>;
};

export type IndexedArrayHeapq<T> = ArrayHeapq<T> & HasIndex<T>;
export type ArrayWithInsort<T> = Array<T> & HasInsort<T>;

export type WrappedNodes = HasWrapperGen<IndexedArrayHeapq<Node>>;
export type WrappedEdges = HasWrapperGen<ArrayWithInsort<Edge>>;
export type ConfigBodyRuntime = ConfigBodyGeneric<WrappedNodes, WrappedEdges>;
export type FlowDataRuntime = FlowDataGeneric<WrappedNodes, WrappedEdges>;

const nodeTypesMap = {
  catalogue: FlowNodesCatalogueMap,
  elements: FlowNodesElementsMap,
};

const nodeTypesElements = {
  catalogue: FlowNodesCatalogue,
  elements: FlowNodesElements,
};

function concatMutable<T>(this: Array<T>, item: T) {
  this.push(item);
  return this;
}

function inSortFunction(this: IndexedArrayHeapq<Node>, newItem: Node) {
  const index = this[indexKey];
  this.heapPush(newItem);
  index.set(newItem.id, newItem);
}

function mesureParentChain(index: Index<Node>, node: Node) {
  let depth = 0;

  while (node.parentNode) {
    node = index.get(node.parentNode) as Node;
    depth++;
  }

  return depth;
}

function compareParentChain(index: Index<Node>, a: Node, b: Node) {
  const depthA = mesureParentChain(index, a);
  const depthB = mesureParentChain(index, b);
  return depthA === depthB ? 0 : depthA < depthB ? -1 : 1;
}

function nodeComparator(this: IndexedArrayHeapq<Node>, a: Node, b: Node) {
  if (a.type === group) {
    if (b.type === group) return compareParentChain(this[indexKey], a, b);
    return -1;
  } else if (b.type === group) return 1;
  return 0;
}

function nodeComparatorBool(this: IndexedArrayHeapq<Node>, a: Node, b: Node) {
  return 0 >= nodeComparator.call(this, a, b);
}

const prepareEdgeArray = (entryArray: Edge[]) => {
  const withBoundCallables = bindCallables(entryArray) as ArrayWithInsort<Edge>;
  withBoundCallables.insort = withBoundCallables.push;
  // @ts-expect-error: 2322
  withBoundCallables.concat = concatMutable.bind(withBoundCallables);
  return wrap(withBoundCallables);
};

const prepareNodeArray = (entryArray: Node[]) => {
  const heap = new ArrayHeapq();
  const withBoundCallables = bindCallables(heap) as IndexedArrayHeapq<Node>;
  const currentInsort = inSortFunction.bind(withBoundCallables);
  withBoundCallables.comparator = nodeComparatorBool.bind(withBoundCallables);
  withBoundCallables.insort = currentInsort;
  withBoundCallables[indexKey] = new Map();
  for (const node of entryArray) currentInsort(node);
  return wrap(withBoundCallables);
};

const prepareFlowData = (entry: FlowData) => {
  entry.nodes = prepareNodeArray(entry.nodes);
  entry.edges = prepareEdgeArray(entry.edges);
  // return wrapCached(entry);
  return entry as FlowDataRuntime;
};

const prepareConfigBody = (config: ConfigBody) => {
  config.data.catalogue = prepareFlowData(config.data.catalogue);
  const elementsMap = config.data.elements;
  for (const [key, value] of Array.from(Object.entries(elementsMap))) {
    elementsMap[key] = prepareFlowData(value);
  }
  return config as ConfigBodyRuntime;
};

export class StateMGR {
  // @ts-expect-error: 2564
  config: ConfigBodyRuntime;
  // @ts-expect-error: 2564
  flowData: FlowDataRuntime;
  // @ts-expect-error: 2564
  nodeTypes: FlowNodeTypeMap<NodeProps>;
  // @ts-expect-error: 2564
  nodeComponents: FlowNodeComponent[];
  // @ts-expect-error: 2564
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  // @ts-expect-error: 2564
  onNodeAdd: (node: Node) => void;

  constructor(config: ConfigBody) {
    this.loadBody(config);
  }

  loadBody = (config: ConfigBody) => {
    this.config = prepareConfigBody(config);
    this.toggle(config.view, false);
  };

  load = (rawConfig: Config) => {
    const body = migrator(rawConfig);
    this.loadBody(body);
  };

  dump = () => {
    return { version: configVersion, data: this.config } as Config;
  };

  onNodeDoubleClickVariants = {
    catalogue: (event: React.MouseEvent, node: Node) => {
      this.toggle({ type: "elements", element: node.id } as View);
    },

    elements: (event: React.MouseEvent, node: Node) => {
      // console.log("not implemented yet");
    },
  };

  onNodeAddVariants = {
    catalogue: (node: Node) => {
      this.config.data.elements[node.id] = prepareFlowData(newFlowData());
    },
    elements: (node: Node) => {
      // console.log(["Added ELEMENT", node]);
    },
  };

  flowDataGetters = {
    catalogue: (view: View) => this.config.data.catalogue,
    elements: (view: View) => this.config.data.elements[view.element],
  };

  toggle = (view: View, update = true) => {
    const { type } = view;
    this.nodeTypes = nodeTypesMap[type];
    this.nodeComponents = nodeTypesElements[type];
    this.onNodeDoubleClick = this.onNodeDoubleClickVariants[type];
    this.onNodeAdd = this.onNodeAddVariants[type];
    this.flowData = this.flowDataGetters[type](view);

    if (update) Object.assign(this.config.view, view);
  };

  nextNodeID = () => {
    const { nodeID } = this.flowData;
    this.flowData.nodeID++;
    return nodeID.toString();
  };

  get nodes() {
    return this.flowData.nodes;
  }

  set nodes(nodes: WrappedNodes) {
    this.flowData.nodes = toggle(nodes);
  }

  get edges() {
    return this.flowData.edges;
  }

  set edges(edges: WrappedEdges) {
    this.flowData.edges = toggle(edges);
  }
}
