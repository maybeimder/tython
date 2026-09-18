export class StateIDGenerator {
      private _indexes: number[] = [0];
      private readonly ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      next(): string {
            let result = "";

            for (let i = 0; i < this._indexes.length; i++) {
                  result += this.ALPHABET[this._indexes[i]];
            }

            let p = this._indexes.length - 1;
            while (p >= 0) {
                  this._indexes[p]++;
                  if (this._indexes[p] < 26) break;

                  this._indexes[p] = 0;
                  p--;
            }

            if (p < 0) this._indexes.unshift(0);

            return result;
      }
}
