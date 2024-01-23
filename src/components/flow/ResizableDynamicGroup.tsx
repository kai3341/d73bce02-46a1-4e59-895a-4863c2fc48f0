import React, { memo } from 'react';
import { NodeResizer, NodeProps} from 'reactflow';

import { myFlowComponentAttrs, group } from './constants';
import { MyMemoExoticComponent, MyFlowComponentAttrsType } from './types';


export type ResizableDynamicGroupData = {
  //
};

type ResizableDynamicGroupProps = NodeProps<ResizableDynamicGroupData>;

export function ResizableDynamicGroupBody(props: ResizableDynamicGroupData) {
  return <div className="react-flow__node-group">GROUP</div>
}

function ResizableDynamicGroup_({ selected }: ResizableDynamicGroupProps) {
  return (
    <NodeResizer isVisible={selected} />
  );
}

export const ResizableDynamicGroup = memo(ResizableDynamicGroup_) as MyMemoExoticComponent<ResizableDynamicGroupProps>;

const meta: MyFlowComponentAttrsType = {
  key: group,
  Body: ResizableDynamicGroupBody,
  defaultProps: {
    style: { width: 400, height: 200 },
  },
};


ResizableDynamicGroup[myFlowComponentAttrs] = meta;
