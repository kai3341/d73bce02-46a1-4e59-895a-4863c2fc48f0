import { APIGateway, APIGatewayData } from "./APIGateway";
import { Database, DatabaseData } from "./Database";
import { FrontEnd, FrontEndData } from "./FrontEnd";
import { ResizableDynamicGroup, ResizableDynamicGroupData } from "./ResizableDynamicGroup";
import { MyMemoExoticComponent } from "./constants";

export const FlowNodes = [
  ResizableDynamicGroup,
  APIGateway,
  Database,
  FrontEnd,
];

export type FlowNodesData = APIGatewayData
  | DatabaseData
  | FrontEndData
  | ResizableDynamicGroupData
;

export interface FlowNodeTypeMap<T> {
  [key: string]: MyMemoExoticComponent<T> | typeof APIGateway;
}

export * from "./constants";
