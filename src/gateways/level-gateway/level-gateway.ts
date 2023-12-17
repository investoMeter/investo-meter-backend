import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GetLevelDto } from '../dto/get-level.dto';
import { Server } from 'socket.io';

@WebSocketGateway(3004)
export class LevelGateway {
  server: Server;

  @SubscribeMessage(`level`)
  onLevel(client: any, req: any): void {
    const data: GetLevelDto = JSON.parse(req);

    console.log(`LevelGateway: onLevel: ${data.levelId}`);
  }
}
