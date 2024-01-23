import {
  ResizableDynamicGroup,
  ResizableDynamicGroupData,
} from "../ResizableDynamicGroup";

import { SimpleNode, SimpleNodeData } from "./SimpleNode";

import { myFlowComponentAttrs } from "../constants";
import { FlowNodeComponent, FlowNodeTypeMap } from "../types";

export const FlowNodesCatalogue = [
  ResizableDynamicGroup,
  SimpleNode,
] as FlowNodeComponent[];

export type FlowNodesCalalogueData = ResizableDynamicGroupData | SimpleNodeData;

export const FlowNodesCatalogueMap: FlowNodeTypeMap = {};

FlowNodesCatalogue.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  FlowNodesCatalogueMap[meta.key] = item;
});
