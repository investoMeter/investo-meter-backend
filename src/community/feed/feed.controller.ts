import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth";
import { FeedService } from "./feed.service";

@Controller("feed")
@ApiTags("feed")
export class FeedController {
  constructor(
    private authService: AuthService,
    private feedService: FeedService,
  ) {}
}
