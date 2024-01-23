import React from "react";
import { NodeProps } from "reactflow";
import { myFlowComponentAttrs } from "../constants";
import { MyFlowComponentAttrsType } from "../types";

export type SimpleNodeData = {
  label?: string;
};

export function SimpleNodeBody(props: SimpleNodeData) {
  const { label = "CATALOGUE" } = props;
  return <div className="react-flow__node-input">{label}</div>;
}

export function SimpleNode(props: NodeProps<SimpleNodeData>) {
  return <SimpleNodeBody {...props.data} />;
}

const meta: MyFlowComponentAttrsType = {
  key: "catalogue",
  Body: SimpleNodeBody,
};

SimpleNode[myFlowComponentAttrs] = meta;
