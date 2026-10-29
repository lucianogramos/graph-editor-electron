export enum VertexEventType {
    CLICK = 'click',
    MOVE = 'move'
}

export interface Observer<T extends string, K> {
    processEvent(type: T, eventData: K): void;
}

export interface Subject<T extends string, K> {
    addObserver(observer: Observer<T, K>): void;
    removeObserver(observer: Observer<T, K>): void;
    dispatchEvent(type: T, eventData: K): void;
}