import { api } from '../lib/api';

export const chatApi = {
    getOrCreateConversation: async (businessId: string) => {
        return api.post('/chat/conversations', { businessId });
    },
    getUserConversations: async () => {
        return api.get('/chat/conversations/user');
    },
    getVendorConversations: async () => {
        return api.get('/chat/conversations/vendor');
    },
    getMessages: async (conversationId: string) => {
        return api.get(`/chat/conversations/${conversationId}/messages`);
    },
    getUnreadCount: async () => {
        return api.get('/chat/unread-count');
    },
    markAsRead: async (conversationId: string) => {
        return api.post(`/chat/conversations/${conversationId}/mark-as-read`, {});
    },
};
