import { useAtom, useAtomValue } from 'jotai';
import { useClickOutside } from '../../hooks/useOutsideClick';
import {
  atomContextMenuActive,
  atomContextMenuPos,
} from '../../stores/contextMenuStore';
import ContextMenuDatabaseItem from './ContextMenuDatabaseItem';
import ContextMenuPlaylistItem from './ContextMenuPlaylistItem';

const ContainerContextMenu = () => {
  const [active, setActive] = useAtom(atomContextMenuActive);
  const pos = useAtomValue(atomContextMenuPos);
  const onClickOutside = useClickOutside(() => setActive(null));

  return (
    active && (
      <div
        ref={onClickOutside}
        className="rounded shadow-lg border border-slate-300 w-48 fixed flex flex-col bg-white py-1"
        style={pos}
      >
        {active === 'playlistItem' && <ContextMenuPlaylistItem />}
        {active === 'databaseItem' && <ContextMenuDatabaseItem />}
      </div>
    )
  );
};

export default ContainerContextMenu;
