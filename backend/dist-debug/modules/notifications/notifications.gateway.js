"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("./ws-jwt.guard");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor() {
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, sockets] of this.connectedUsers.entries()) {
            if (sockets.includes(client.id)) {
                const updatedSockets = sockets.filter(id => id !== client.id);
                if (updatedSockets.length === 0) {
                    this.connectedUsers.delete(userId);
                }
                else {
                    this.connectedUsers.set(userId, updatedSockets);
                }
                break;
            }
        }
    }
    handleAuthenticate(client) {
        const userId = client.user.id;
        const sockets = this.connectedUsers.get(userId) || [];
        if (!sockets.includes(client.id)) {
            sockets.push(client.id);
        }
        this.connectedUsers.set(userId, sockets);
        this.logger.log(`User ${userId} authenticated on socket ${client.id}`);
        return { status: 'authenticated' };
    }
    sendToUser(userId, event, data) {
        const sockets = this.connectedUsers.get(userId);
        if (sockets) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit(event, data);
            });
            this.logger.log(`Notification sent to user ${userId}: ${event}`);
        }
        else {
            this.logger.log(`User ${userId} not connected, notification stored? (future)`);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleAuthenticate", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'notifications',
    })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map