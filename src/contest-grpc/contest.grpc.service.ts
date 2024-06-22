import { Injectable } from "@nestjs/common";
import {
  Contest,
  ContestsThatFinishedRequest,
} from "./dto/endedContests.interface";

@Injectable()
export class ContestGrpcService {
  async endContests(data: ContestsThatFinishedRequest): Promise<void> {
    for (const contest of data.endContests) {
      console.log(`Contest ${contest.contestId} has ended`);
      console.log(`Room IDs: ${contest.roomIds}`);
      this.calculateWinner(contest);
    }
  }

  calculateWinner(contest: Contest): void {
    return;
  }
}
