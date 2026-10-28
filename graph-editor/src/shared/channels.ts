const prefix = 'graph-editor'

function createChannel(channel: string) {
    return `${prefix}:${channel}`;
}

export const IPC_CHANNELS = {
    QUIT: createChannel('quit'),
    GET_THEME: createChannel('gettheme'),
    CHANGE_THEME: createChannel('changetheme')
} as const;
