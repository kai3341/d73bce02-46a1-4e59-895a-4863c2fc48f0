import { Node } from "reactflow";

const group = 'group';


export class NodeSorter {
  // readonly ["constructor"]: typeof NodeSorter

  nodes: Node[]
  nodeMap: Map<string, Node>

  static readonly buildNodeMap = (nodes: Node[]) => {
    const nodeMap = new Map<string, Node>();
    for (const node of nodes) nodeMap.set(node.id, node);
    return nodeMap;
  }

  static readonly sort = (nodes: Node[]) => {
    console.log([...nodes])
    const self = new this(nodes)
    nodes.sort(self.compare)
    console.log(nodes)
    return nodes
  }

  constructor(nodes: Node[]) {
    this.nodes = nodes;
    this.nodeMap = ThisConstructor.buildNodeMap(nodes);
  }

  mesureParentChain = (node: Node) => {
    let depth = 0;

    while (node.parentNode) {
      node = this.nodeMap.get(node.parentNode) as Node
      depth++;
    }

    return depth
  }

  compareParentChain = (a: Node, b: Node) => {
    const depthA = this.mesureParentChain(a)
    const depthB = this.mesureParentChain(b)
    return depthA === depthB
    ? 0
    : depthA < depthB
      ? -1
      : 1
  }

  compare = (a: Node, b: Node) => {
    if (a.type === group) {
      if (b.type === group) {
        return this.compareParentChain(a, b)
      } else {
        return -1
      }
    } else if (b.type === group) {
      return 1
    } else return 0
  }
}

// it looks typescript's OOP is completelly broken
const ThisConstructor = NodeSorter;
