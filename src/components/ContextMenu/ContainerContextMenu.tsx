import { useAtom, useAtomValue } from 'jotai';
import { useClickOutside } from '../../hooks/useOutsideClick';
import {
  atomContextMenuActive,
  atomContextMenuPos,
} from '../../stores/contextMenuStore';
import ContextMenuDatabaseItem from './ContextMenuDatabaseItem';
import ContextMenuPlaylistItem from './ContextMenuPlaylistItem';

const ContainerContextMenu = () => {
  const [contextMenuActive, setContextMenuActive] = useAtom(
    atomContextMenuActive,
  );
  const contextMenuPos = useAtomValue(atomContextMenuPos);
  const onClickOutside = useClickOutside(() => setContextMenuActive(null));

  return (
    contextMenuActive && (
      <div
        ref={onClickOutside}
        className="rounded shadow-lg border border-slate-300 w-48 fixed flex flex-col bg-white py-1"
        style={contextMenuPos}
      >
        {contextMenuActive === 'playlistItem' && <ContextMenuPlaylistItem />}
        {contextMenuActive === 'databaseItem' && <ContextMenuDatabaseItem />}
      </div>
    )
  );
};

export default ContainerContextMenu;
