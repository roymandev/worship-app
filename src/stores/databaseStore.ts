import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { parseContent } from '../lib/parseContent';
import { DatabaseItem } from '../types/itemTypes';

const dummyLyrics: DatabaseItem[] = [
  {
    id: '1',
    title: 'NP 1 Suci, Suci, Suci',
    content: '',
  },
  {
    id: '2',
    title: 'NP 2 Tuhan Yang Mahabesar',
    content: `#Verse 1\n\nDIALAH ALLAH YANG MENYEMBUHKAN\n\nDIALAH ALLAH YANG MENCUKUPI\n\nDIALAH PANJI KESELAMATAN\n\nDIALAH RAJA DAMAI\n\n#Chorus\n\nYEHOVA RAPHA ALLAH YANG MENYEMBUHKAN\n\nYEHOVA JIREH ALLAH YANG MENCUKUPI\n\nYEHOVA NISSI PANJI KESELAMATAN\n\nYEHOVA SHALLOM SANG DAMAI\n\n#End`,
  },
];

export const atomDatabaseItems = atomWithStorage<DatabaseItem[]>(
  'databaseItems',
  dummyLyrics,
);

export const atomDatabaseSelectedItemIndex = atom(-1);

export const atomDatabaseParsedSelectedItem = atom((get) => {
  const selectedItem =
    get(atomDatabaseItems)[get(atomDatabaseSelectedItemIndex)];
  if (selectedItem) {
    return {
      ...selectedItem,
      content: parseContent(selectedItem.content, true),
    };
  }
  return null;
});
