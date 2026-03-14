import * as signalR from '@microsoft/signalr';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5182';

let notificationConnection: signalR.HubConnection | null = null;
let chatConnection: signalR.HubConnection | null = null;

function createConnection(hubPath: string): signalR.HubConnection {
    const token = localStorage.getItem('access_token');

    return new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/${hubPath}`, {
            accessTokenFactory: () => token || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();
}

export async function connectNotifications(
    onNotification: (notification: unknown) => void
): Promise<signalR.HubConnection> {
    if (notificationConnection) {
        await notificationConnection.stop();
    }

    notificationConnection = createConnection('notifications');

    notificationConnection.on('ReceiveNotification', onNotification);

    notificationConnection.onreconnected(() => {
        console.log('[SignalR] Notification hub reconnected');
    });

    await notificationConnection.start();
    console.log('[SignalR] Connected to notification hub');

    return notificationConnection;
}

export async function connectChat(
    onMessage: (message: unknown) => void,
    onTyping?: (data: unknown) => void,
    onMessagesDeleted?: (ids: string[]) => void
): Promise<signalR.HubConnection> {
    if (!chatConnection) {
        chatConnection = createConnection('chat');
    }

    chatConnection.off('ReceiveMessage');
    chatConnection.off('UserTyping');
    chatConnection.off('MessagesDeleted');

    chatConnection.on('ReceiveMessage', onMessage);
    if (onTyping) {
        chatConnection.on('UserTyping', onTyping);
    }
    if (onMessagesDeleted) {
        chatConnection.on('MessagesDeleted', onMessagesDeleted);
    }

    if (chatConnection.state === signalR.HubConnectionState.Disconnected) {
        try {
            await chatConnection.start();
            console.log('[SignalR] Connected to chat hub');
        } catch (err) {
            console.warn('[SignalR] Connection start issue (safe to ignore if cancelled):', err);
        }
    }

    return chatConnection;
}

export async function joinChatChannel(channelId: string): Promise<void> {
    if (chatConnection?.state === signalR.HubConnectionState.Connected) {
        await chatConnection.invoke('JoinChannel', channelId);
    }
}

export async function leaveChatChannel(channelId: string): Promise<void> {
    if (chatConnection?.state === signalR.HubConnectionState.Connected) {
        await chatConnection.invoke('LeaveChannel', channelId);
    }
}

export async function sendChatMessage(channelId: string, message: string): Promise<void> {
    if (chatConnection?.state === signalR.HubConnectionState.Connected) {
        await chatConnection.invoke('SendMessage', channelId, message);
    }
}

export async function sendTypingIndicator(channelId: string): Promise<void> {
    if (chatConnection?.state === signalR.HubConnectionState.Connected) {
        await chatConnection.invoke('TypingIndicator', channelId);
    }
}

export function disconnectAll(): void {
    notificationConnection?.stop();
    chatConnection?.stop();
    notificationConnection = null;
    chatConnection = null;
}
