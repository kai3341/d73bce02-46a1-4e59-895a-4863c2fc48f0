// mutable fork of:
// https://github.com/xyflow/xyflow/blob/main/packages/react/src/utils/changes.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
// import { EdgeLookup, NodeLookup } from '@xyflow/system';
import type { EdgeChange, NodeChange } from 'reactflow';

import type { WrappedNodes, WrappedEdges, ArrayWithInsort } from './statemgr';

// type AnyElements = WrappedNodes|WrappedEdges;


export function handleParentExpand(
  updatedElements: any[],
  updateItem: any,
): void {
  for (const [index, item] of updatedElements.entries()) {
    if (item.id === updateItem.parentNode) {
      const parent = { ...item };

      if (!parent.computed) {
        parent.computed = {};
      }

      const extendWidth = updateItem.position.x + updateItem.computed.width - parent.computed.width;
      const extendHeight = updateItem.position.y + updateItem.computed.height - parent.computed.height;

      if (extendWidth > 0 || extendHeight > 0 || updateItem.position.x < 0 || updateItem.position.y < 0) {
        parent.width = parent.width ?? parent.computed.width;
        parent.height = parent.height ?? parent.computed.height;

        if (extendWidth > 0) {
          parent.width += extendWidth;
        }

        if (extendHeight > 0) {
          parent.height += extendHeight;
        }

        if (updateItem.position.x < 0) {
          const xDiff = Math.abs(updateItem.position.x);
          parent.position.x = parent.position.x - xDiff;
          parent.width += xDiff;
          updateItem.position.x = 0;
        }

        if (updateItem.position.y < 0) {
          const yDiff = Math.abs(updateItem.position.y);
          parent.position.y = parent.position.y - yDiff;
          parent.height += yDiff;
          updateItem.position.y = 0;
        }

        parent.computed.width = parent.width;
        parent.computed.height = parent.height;

        updatedElements[index] = parent;
      }
      break;
    }
  }
}

// This function applies changes to nodes or edges that are triggered by React Flow internally.
// When you drag a node for example, React Flow will send a position change update.
// This function then applies the changes and returns the updated elements.
function applyChanges(changes: any[], elements: ArrayWithInsort<any>): any[] {
  // const updatedElements: any[] = [];
  // By storing a map of changes for each element, we can a quick lookup as we
  // iterate over the elements array!
  const changesMap = new Map<any, any[]>();

  for (const change of changes) {
    if (change.type === 'add') {
      // updatedElements.push(change.item);
      elements.insort(change.item);
      continue;
    } else if (change.type === 'remove' || change.type === 'replace') {
      // For a 'remove' change we can safely ignore any other changes queued for
      // the same element, it's going to be removed anyway!
      changesMap.set(change.id, [change]);
    } else {
      const elementChanges = changesMap.get(change.id);

      if (elementChanges) {
        // If we have some changes queued already, we can do a mutable update of
        // that array and save ourselves some copying.
        elementChanges.push(change);
      } else {
        changesMap.set(change.id, [change]);
      }
    }
  }

  for (let idx = 0; idx < elements.length; idx++) {
    const element = elements[idx];
    const changes = changesMap.get(element.id);

    // When there are no changes for an element we can just push it unmodified,
    // no need to copy it.
    if (!changes) {
      // updatedElements.push(element);
      continue;
    }

    // If we have a 'remove' change queued, it'll be the only change in the array
    if (changes[0].type === 'remove') {
      elements.splice(idx, 1);
      idx--;
      continue;
    }

    if (changes[0].type === 'replace') {
      // updatedElements.push({ ...changes[0].item });
      elements[idx] = { ...changes[0].item };
      continue;
    }

    // For other types of changes, we want to start with a shallow copy of the
    // object so React knows this element has changed. Sequential changes will
    /// each _mutate_ this object, so there's only ever one copy.
    const updatedElement = { ...element };

    for (const change of changes) {
      applyChange(change, updatedElement, elements);
    }

    elements[idx] = updatedElement;
    // updatedElements.push(updatedElement);
  }

  // return updatedElements;
  return elements;
}

// Applies a single change to an element. This is a *mutable* update.
function applyChange(change: any, element: any, elements: any[] = []): void {
  switch (change.type) {
    case 'select': {
      element.selected = change.selected;
      break;
    }

    case 'position': {
      // console.log(["position", change.position])
      if (typeof change.position !== 'undefined') {
        element.position = change.position;
      }

      if (typeof change.positionAbsolute !== 'undefined') {
        element.computed ??= {};
        element.computed.positionAbsolute = change.positionAbsolute;
      }

      if (typeof change.dragging !== 'undefined') {
        element.dragging = change.dragging;
      }

      if (element.expandParent) {
        handleParentExpand(elements, element);
      }
      break;
    }

    case 'dimensions': {
    if (typeof change.dimensions !== 'undefined') {
        const changeGeometry = {
          width: change.dimensions.width,
          height: change.dimensions.height,
        };
        element.computed ??= {};
        Object.assign(element.computed, changeGeometry);

        if (element.style) {
          Object.assign(element.style, changeGeometry);
          element.style = {...element.style};
        }
        // element.computed.width = change.dimensions.width;
        // element.computed.height = change.dimensions.height;

        if (change.resizing) {
          Object.assign(element, changeGeometry);
          // element.width = change.dimensions.width;
          // element.height = change.dimensions.height;
        }
      }

      if (typeof change.resizing === 'boolean') {
        element.resizing = change.resizing;
      }

      if (element.expandParent) {
        handleParentExpand(elements, element);
      }

      break;
    }
  }
}


export function applyNodeChanges(
  changes: NodeChange[],
  nodes: WrappedNodes
) {
  return applyChanges(changes, nodes) as WrappedNodes;
}


export function applyEdgeChanges(
  changes: EdgeChange[],
  edges: WrappedEdges
) {
  return applyChanges(changes, edges) as WrappedEdges;
}
