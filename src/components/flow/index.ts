import { APIGateway, APIGatewayData } from "./APIGateway";
import { Database, DatabaseData } from "./Database";
import { FrontEnd, FrontEndData } from "./FrontEnd";
import { ResizableDynamicGroup, ResizableDynamicGroupData } from "./ResizableDynamicGroup";
import { MyMemoExoticComponent, myFlowComponentAttrs } from "./constants";

import { NodeProps } from "reactflow";

export const FlowNodesElements = [
  ResizableDynamicGroup,
  APIGateway,
  Database,
  FrontEnd,
];

export const FlowNodesCatalogue = [
  ResizableDynamicGroup,
];

export type FlowNodesData = APIGatewayData
  | DatabaseData
  | FrontEndData
  | ResizableDynamicGroupData
;

export type FlowNodeComponent<T> = typeof APIGateway | MyMemoExoticComponent<T>;

export interface FlowNodeTypeMap<T> {
  [key: string]: FlowNodeComponent<T>;
}

export const FlowNodesElementsMap: FlowNodeTypeMap<NodeProps> = {};

FlowNodesElements.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  FlowNodesElementsMap[meta.key] = item;
})

export const FlowNodesCatalogueMap: FlowNodeTypeMap<NodeProps> = {};

FlowNodesCatalogue.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  FlowNodesCatalogueMap[meta.key] = item;
})


export * from "./constants";
