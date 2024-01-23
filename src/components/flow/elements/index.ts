import { APIGateway, APIGatewayData } from "./APIGateway";
import { Database, DatabaseData } from "./Database";
import { FrontEnd, FrontEndData } from "./FrontEnd";

import { ResizableDynamicGroup, ResizableDynamicGroupData } from "../ResizableDynamicGroup";
import { myFlowComponentAttrs } from "../constants";
import { FlowNodeComponent, FlowNodeTypeMap } from "../types";


export const FlowNodesElements = [
  ResizableDynamicGroup,
  APIGateway,
  Database,
  FrontEnd,
] as FlowNodeComponent[];


export type FlowNodesElementsData = ResizableDynamicGroupData
  | APIGatewayData
  | DatabaseData
  | FrontEndData
;

export const FlowNodesElementsMap: FlowNodeTypeMap= {};

FlowNodesElements.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  FlowNodesElementsMap[meta.key] = item;
})
