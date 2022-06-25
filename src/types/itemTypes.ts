export interface BaseItemContentLine {
  text: string;
  type?: string;
}

export interface BaseItem {
  title: string;
  content: BaseItemContentLine[];
}

export interface DatabaseItem extends BaseItem {
  id: string;
}

export interface PlaylistItem extends DatabaseItem {
  note?: string;
}
