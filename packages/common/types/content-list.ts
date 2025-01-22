import type { CustomParams } from './custom-params';

export type ContentListItem = {
  media_id: string;
  title: string;
  description: string | null;
  tags: string[];
  duration: number;
  custom_params: CustomParams;
};

export type ContentList = {
  id: string;
  title: string;
  description: string | undefined;
  list: ContentListItem[];
};

export type GetContentSearchParams = { searchTerm: string };
