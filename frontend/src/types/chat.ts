export interface IMessage {
    _id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: string;
}

export interface ChatProps {
    currentUserId: string;
    targetUserId: string;
    targetUserName: string;
}