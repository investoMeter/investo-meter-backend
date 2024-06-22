import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { ContestGrpcService } from "./contest.grpc.service";
import { ContestsThatFinishedRequest } from "./dto/endedContests.interface";

@Controller("contest-grpc")
export class ContestGrpcController {
  constructor(private readonly service: ContestGrpcService) {}

  @GrpcMethod("contestStatusService", "notifyContestsAreOver")
  notifyContestsAreOver(data: ContestsThatFinishedRequest): Promise<void> {
    console.log(data);
    return this.service.endContests(data);
  }
}
