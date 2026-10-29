export interface Event {
    cancel: boolean;
    readonly target?: any;
    readonly currentTarget?: any;
}
