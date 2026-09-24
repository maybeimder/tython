export type Unsubscribe = () => void;

export class Emitter<T>{
      private listeners: ((payload: T) => void)[] = [];

      subscribe(listener: (payload: T) => void): Unsubscribe {
            this.listeners.push(listener);
            return () => { this.listeners = this.listeners.filter(l => l !== listener) };
      }

      emit(payload: T) {
            this.listeners.forEach(listener => listener(payload));
      }
}
