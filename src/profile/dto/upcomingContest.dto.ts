export interface UpcomingContestDto {
  contestId: number,
  name: string;
  startDate: Date;
  isPrivate: boolean;
  communityId?: string | null,
  communityName: string,
  isOwner: boolean
}
