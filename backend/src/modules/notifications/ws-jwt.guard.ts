import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const authToken = client.handshake?.auth?.token || client.handshake?.headers?.authorization;

        if (!authToken) {
            return false;
        }

        const token = authToken.split(' ')[1] || authToken;

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            // Attach user to client
            client.user = payload;
            return true;
        } catch (err) {
            this.logger.error(`WS Authentication failed: ${err.message}`);
            return false;
        }
    }
}
