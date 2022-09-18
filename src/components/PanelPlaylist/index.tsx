import BasePanel from '@/components/BasePanel';
import ContentExport from '@/components/PanelPlaylist/ContentExport';
import ContentImport from '@/components/PanelPlaylist/ContentImport';
import ContentItemEditor from '@/components/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import Header from '@/components/PanelPlaylist/Header';
import {
  atomPlaylistItems,
  atomPlaylistPanelContent,
  atomPlaylistSelectedItem,
  atomPlaylistSelectedItemId,
} from '@/stores/playlistStore';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { nanoid } from 'nanoid';

const PanelPlaylist = () => {
  const [panelContent, setPanelContent] = useAtom(atomPlaylistPanelContent);
  const setItems = useSetAtom(atomPlaylistItems);
  const selectedItem = useAtomValue(atomPlaylistSelectedItem);
  const setSelectedItemId = useSetAtom(atomPlaylistSelectedItemId);

  const onCancelHandler = () => setPanelContent('list');

  return (
    <BasePanel>
      <Header />
      {panelContent === 'list' && <ContentList />}
      {panelContent === 'export' && <ContentExport />}
      {panelContent === 'import' && <ContentImport />}
      {panelContent === 'addItem' && (
        <ContentItemEditor
          title="Add Item"
          item={{ id: nanoid(), title: '', content: [] }}
          onCancel={onCancelHandler}
          onSubmit={(item) => {
            setItems((prevItems) => [...prevItems, item]);
            setSelectedItemId(item.id);
            setPanelContent('list');
          }}
        />
      )}
      {panelContent === 'editItem' && selectedItem && (
        <ContentItemEditor
          title="Edit Item"
          item={selectedItem}
          onCancel={onCancelHandler}
          onSubmit={(item) => {
            const newItem = { ...selectedItem, ...item };
            setItems((prevItems) =>
              prevItems.map((item) =>
                item.id === selectedItem.id ? newItem : item,
              ),
            );
            setSelectedItemId(newItem.id);
            setPanelContent('list');
          }}
        />
      )}
    </BasePanel>
  );
};

export default PanelPlaylist;
