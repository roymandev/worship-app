import { RiPlayListAddFill } from 'react-icons/ri';
import ButtonContextMenu from '../Buttons/ButtonContextMenu';

const ContextMenuDatabaseItem = () => {
  return (
    <>
      <ButtonContextMenu color="blue">
        Add to playlist
        <RiPlayListAddFill className="h-4 w-4" />
      </ButtonContextMenu>
    </>
  );
};

export default ContextMenuDatabaseItem;
