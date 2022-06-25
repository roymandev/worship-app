export interface BaseItemContentLine {
  text: string;
  type?: string;
}

export interface BaseItem {
  title: string;
  content: BaseItemContentLine[];
}

export interface DatabaseItem extends Omit<BaseItem, 'content'> {
  id: string;
  content: string;
}

export interface PlaylistItem extends BaseItem {
  id: string;
  note?: string;
}
