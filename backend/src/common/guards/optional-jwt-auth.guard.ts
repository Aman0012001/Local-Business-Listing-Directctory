import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard but NEVER rejects the request.
 * If a valid JWT is present, req.user will be populated.
 * If no token / invalid token, req.user will be undefined.
 * Use on public routes that still benefit from knowing who is calling.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Always attempt to validate, but don't throw on failure
        return super.canActivate(context);
    }

    handleRequest(_err: any, user: any) {
        // Instead of throwing, just return null when auth fails
        return user ?? null;
    }
}
