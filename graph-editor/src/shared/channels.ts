const prefix = 'graph-editor'

function createChannel(channel: string) {
    return `${prefix}:${channel}`;
}

export const IPC_CHANNELS = {
    QUIT: createChannel('quit'),
    GET_THEME: createChannel('get-theme'),
    GET_THEME_COLORS: createChannel('get-theme-colors'),
    CHANGE_THEME: createChannel('change-theme'),
    ADD_VERTEX: createChannel('add-vertex'),
    REMOVER_VERTEX: createChannel('remove-vertex'),
    ADD_EDGE: createChannel('add-edge'),
    REMOVE_EDGE: createChannel('remove-edge')
} as const;
