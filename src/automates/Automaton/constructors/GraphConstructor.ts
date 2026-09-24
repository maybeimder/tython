export interface GraphConstructor<O, Base> {
      build(automaton: O, node: Base): Fragment;
}

export class Fragment {
      readonly left: string;
      readonly right: string;

      constructor(left: string, right: string) {
            this.left = left;
            this.right = right;
      }
}
