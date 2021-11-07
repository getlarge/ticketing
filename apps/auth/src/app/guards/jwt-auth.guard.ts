import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@ticketing/microservices/shared/fastify-passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
