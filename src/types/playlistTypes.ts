export interface BaseItem {
  title: string;
  content: {
    text: string;
    type?: string;
  }[];
}

export interface PlaylistItem extends BaseItem {
  id: string;
  note?: string;
}
