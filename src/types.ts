export interface BaseItemContentLine {
  text: string;
  type?: string;
}

export interface BaseItem {
  id: string;
  title: string;
  content: BaseItemContentLine[];
}

export interface PlaylistItem extends BaseItem {
  note?: string;
}

export interface PlaylistFile {
  name: string;
  items: PlaylistItem[];
}
