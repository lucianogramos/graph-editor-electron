export enum VertexEventType {
    CLICK = 'CLICK',
    MOVE = 'MOVE'
}

export interface VertexEventData {
    vertex: any; 
    x?: number;  
    y?: number;  
    event?: any; 
}

export interface Observer<T, K> {
    processEvent(type: T, eventData: K): void;
}

export interface Subject<T, K> {
    addObserver(observer: Observer<T, K>): void;
    removeObserver(observer: Observer<T, K>): void;
    dispatchEvent(type: T, eventData: K): void;
}