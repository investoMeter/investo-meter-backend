export interface ContestsThatFinishedRequest {
  endContests: Contest[];
}
export interface Contest {
  contestId: number;
  roomIds: number[];
}
