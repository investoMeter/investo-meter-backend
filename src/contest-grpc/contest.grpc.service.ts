import { Injectable } from '@nestjs/common';
import { EndedContests } from './dto/endedContests.interface';

@Injectable()
export class ContestGrpcService {
  async endContests(data: EndedContests): Promise<void> {
    for (const contestId of data.contestsIds) {
      console.log(`Contest ${contestId} has ended`);
      this.calculateWinner(contestId);
    }
  }

  calculateWinner(contestId: number): void {
    return;
  }
}
