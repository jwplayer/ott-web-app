export type EpgChannel = {
  id: string;
  title: string;
  description: string;
  channelLogoImage: string;
  backgroundImage: string;
  programs: EpgProgram[];
  catchupHours: number;
};

export type EpgProgram = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  cardImage?: string;
  backgroundImage?: string;
};
