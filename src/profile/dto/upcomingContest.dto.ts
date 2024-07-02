export interface UpcomingContestDto {
  contestId: number,
  name: string;
  date: Date;
  isPrivate: boolean;
  communityId?: string | null,
  communityName: string,
  isOwner: boolean
}
