import { Injectable } from "@nestjs/common";
import {
  ContestsThatFinishedRequest,
} from "./dto/endedContests.interface";
import { ContestService } from "src/contest/contest.service";

@Injectable()
export class ContestGrpcService {
  constructor(private readonly contestService: ContestService) {}

  async endContests(data: ContestsThatFinishedRequest): Promise<void> {
    for (const contest of data.endContests) {
      const contestId = contest.contestId;
      for (const roomId of contest.roomIds) {
        this.contestService.rewardWinners(contestId, roomId);
      }
    }
  }
}
