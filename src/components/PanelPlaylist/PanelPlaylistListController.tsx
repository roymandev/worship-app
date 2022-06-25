import { useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiPencilLine,
} from 'react-icons/ri';
import { ListControllerWithSetItemsReturns } from '../../lib/listController';
import { atomPlaylistPanelContent } from '../../stores/playlistStore';
import { PlaylistItem } from '../../types/itemTypes';
import ButtonDefault from '../Buttons/ButtonDefault';

export interface PanelPlaylistListControllerProps {
  listHandler: ListControllerWithSetItemsReturns<PlaylistItem>;
}

const PanelPlaylistListController = ({
  listHandler,
}: PanelPlaylistListControllerProps) => {
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  return (
    <div className="flex flex-col gap-1 p-1">
      <ButtonDefault
        tabIndex={-1}
        color="blue"
        className="p-1.5"
        onClick={() => setPlaylistPanelContent('addItem')}
      >
        <RiAddLine className="w-4 h-4" />
      </ButtonDefault>
      <hr />
      <ButtonDefault
        tabIndex={-1}
        color="gray"
        className="p-1.5"
        onClick={listHandler.moveSelectedItemUp}
        disabled={!listHandler.canShiftSelectedItemUp()}
      >
        <RiArrowUpLine className="w-4 h-4" />
      </ButtonDefault>
      <ButtonDefault
        tabIndex={-1}
        color="gray"
        className="p-1.5"
        onClick={listHandler.moveSelectedItemDown}
        disabled={!listHandler.canShiftSelectedItemDown()}
      >
        <RiArrowDownLine className="w-4 h-4" />
      </ButtonDefault>
      <hr />
      <ButtonDefault
        tabIndex={-1}
        color="gray"
        className="p-1.5"
        onClick={() => setPlaylistPanelContent('itemEditor')}
        disabled={!listHandler.selectedItem()}
      >
        <RiPencilLine className="w-4 h-4" />
      </ButtonDefault>
      <ButtonDefault
        tabIndex={-1}
        color="red"
        className="p-1.5"
        onClick={listHandler.removeSelectedItem}
        disabled={!listHandler.selectedItem()}
      >
        <RiDeleteBin2Line className="w-4 h-4" />
      </ButtonDefault>
    </div>
  );
};

export default PanelPlaylistListController;
