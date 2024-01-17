import { FC, MemoExoticComponent } from 'react';
import { Node } from "reactflow";

export const myFlowComponentAttrs = Symbol("myFlowComponentAttrs")

export type myFlowComponentAttrsType = {
  key: string,
  Body: FC,
  defaultProps?: Omit<Node, 'id' | 'data' | 'position'>,
  // config: FC,
};

type MyMixin = {
  [myFlowComponentAttrs]: myFlowComponentAttrsType,
};

export type MyMemoExoticComponent<T> = MemoExoticComponent<FC<T>> & MyMixin
