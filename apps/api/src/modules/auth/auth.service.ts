import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(email: string, pass: string) {
<<<<<<< HEAD
        const normalizedEmail = email.toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
=======
        const user = await this.usersService.findByEmail(email);
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
        if (!user || user.password !== pass) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };
    }

    async register(userData: any) {
<<<<<<< HEAD
        const normalizedEmail = userData.email.toLowerCase();
        const existing = await this.usersService.findByEmail(normalizedEmail);
=======
        const existing = await this.usersService.findByEmail(userData.email);
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        // In production, HASH THIS PASSWORD!
        const newUser = await this.usersService.create({
<<<<<<< HEAD
            email: normalizedEmail,
=======
            email: userData.email,
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
            password: userData.password,
            fullName: userData.fullName,
            role: userData.role || 'user',
            firebaseUid: `local_${Date.now()}` // Mock UID for compatibility
        });

        return this.login(newUser.email, newUser.password);
    }
}
