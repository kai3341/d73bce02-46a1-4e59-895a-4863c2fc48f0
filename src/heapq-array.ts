// Local fork of:
// https://github.com/andrewnester/ts-heapq/blob/master/src/heapq.ts

// This implementation should be JSON serializable nativelly


export class ArrayHeapq<T> extends Array<T> {
  // @ts-expect-error: 2564
  comparator: (a: T, b: T) => boolean

  heapPush(item: T) {
    this.push(item);
    this.heapSiftdown(0, this.length - 1);
  }

  heapPop(): T {
    if (this.length === 0) throw new Error("Heap is empty");

    const last = this[this.length - 1];
    const returnItem: T = this[0];

    this.pop();

    this[0] = last;
    this.heapSiftup(0);
    return returnItem;
  }

  heapReplace(item: T): T {
    const returnItem: T = this[0];
    this[0] = item;
    this.heapSiftup(0);

    // return item;
    return returnItem;
  }

  heapPushPop(item: T): T {
    if (this.length && this.comparator(this[0], item)) {
      [item, this[0]] = [this[0], item];
      this.heapSiftup(0);
    }

    return item;
  }

  heapTop(): T {
    return this[0];
  }

  heapify() {
    const n = this.length;
    for (let i = n / 2; i >= 0; i--) {
      this.heapSiftup(i);
    }
  }

  private heapSiftdown(startPos: number, pos: number) {
    const newItem = this[pos];
    if (newItem === undefined) return;

    while (pos > startPos) {
      const parentPos = ((pos - 1) >> 1);
      const parent = this[parentPos];
      if (this.comparator(newItem, parent)) {
        this[pos] = parent;
        pos = parentPos;
        continue;
      }

      break;
    }

    this[pos] = newItem;
  }

  private heapSiftup(pos: number) {
    const newItem = this[pos];

    if (newItem === undefined) return;

    const endPos: number = this.length;
    const startPos: number = pos;

    let childPos: number = 2 * pos + 1;
    while (childPos < endPos) {
      const rightPos = childPos + 1;
      if (rightPos < endPos && !this.comparator(this[childPos], this[rightPos])) {
        childPos = rightPos;
      }

      this[pos] = this[childPos];
      pos = childPos;
      childPos = 2 * pos + 1;
    }

    this[pos] = newItem;
    this.heapSiftdown(startPos, pos);
  }
}
