import { Node, Edge } from "reactflow";

export type FlowDataGeneric<N, E> = {
  nodeID: number;
  nodes: N;
  edges: E;
};

export type FlowData = FlowDataGeneric<Node[], Edge[]>;

export interface ElementsMapGeneric<N, E> {
  [key: string]: FlowDataGeneric<N, E>;
}

// export type ElementsMap = ElementsMapGeneric<Node[], Edge[]>

export type ViewMapGeneric<N, E> = {
  catalogue: FlowDataGeneric<N, E>;
  elements: ElementsMapGeneric<N, E>;
};

export type ViewMap = ViewMapGeneric<Node[], Edge[]>;

export type ViewType = keyof ViewMap;

export type View = {
  type: ViewType;
  element: string;
};

export type ConfigBodyGeneric<N, E> = {
  view: View;
  data: ViewMapGeneric<N, E>;
};

export type ConfigBody = ConfigBodyGeneric<Node[], Edge[]>;

export const newFlowData = () =>
  ({ nodeID: 0, nodes: [], edges: [] } as FlowData);

export const defaultConfigBodyFactory = () =>
  ({
    view: {
      type: "elements",
      element: "0",
    },
    data: {
      catalogue: {
        nodeID: 1,
        nodes: [
          {
            id: "0",
            data: {},
            type: "catalogue",
            position: { x: 0, y: 0 },
            width: 400,
            height: 200,
          },
        ],
        edges: [],
      },
      elements: {
        "0": newFlowData(),
      },
    },
  } as ConfigBody);

// eslint-disable-next-line
type RawDataType = any;

export type ConfigGeneric<T> = {
  version: number;
  data: T;
};

export type Config = ConfigGeneric<RawDataType>;

type Migration = (config: RawDataType) => RawDataType;
const migrations: Migration[] = [];

export const configVersion = migrations.length;

export function migrator(config: Config) {
  let { data, version } = config;
  for (; version < configVersion; version++) data = migrations[version](data);
  return data as ConfigBody;
}
