export type BaseItemContentLine = {
  text: string;
  type?: string;
};

export type BaseItem = {
  title: string;
  content: BaseItemContentLine[];
};

export type SongItem = BaseItem & {
  id: string;
};

export type PlaylistItem = SongItem & {
  note?: string;
};

export interface PlaylistFile {
  name: string;
  items: PlaylistItem[];
}
