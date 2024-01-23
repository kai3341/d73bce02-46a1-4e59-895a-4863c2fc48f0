import { FC, MemoExoticComponent } from "react";
import { Node, NodeProps } from "reactflow";

import { myFlowComponentAttrs } from "./constants";

export type MyFlowComponentAttrsType = {
  key: string;
  Body: FC;
  defaultProps?: Omit<Node, "id" | "data" | "position">;
  // config: FC,
};

type MyMixin = {
  [myFlowComponentAttrs]: MyFlowComponentAttrsType;
};

export type MyFCComponent<T> = FC<T> & MyMixin;
export type MyMemoExoticComponent<T> = MemoExoticComponent<FC<T>> & MyMixin;
export type MyComponent<T> = MyFCComponent<T> | MyMemoExoticComponent<T>;

export type FlowNodeComponent = MyComponent<NodeProps>;

export interface FlowNodeTypeMap {
  [key: string]: FlowNodeComponent;
}
