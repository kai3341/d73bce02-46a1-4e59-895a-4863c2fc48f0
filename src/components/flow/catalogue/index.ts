import { ResizableDynamicGroup, ResizableDynamicGroupData } from "../ResizableDynamicGroup";
import { myFlowComponentAttrs } from "../constants";
import { FlowNodeComponent, FlowNodeTypeMap } from "../types";

export const FlowNodesCatalogue = [
  ResizableDynamicGroup,
] as FlowNodeComponent[];


export type FlowNodesCalalogueData = ResizableDynamicGroupData;


export const FlowNodesCatalogueMap: FlowNodeTypeMap = {};

FlowNodesCatalogue.forEach((item) => {
  const meta = item[myFlowComponentAttrs];
  FlowNodesCatalogueMap[meta.key] = item;
})
