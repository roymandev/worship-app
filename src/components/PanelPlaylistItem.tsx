import { twMerge } from 'tailwind-merge';
import { PlaylistItem } from '../types/playlistTypes';

interface PanelPlaylistItemProps {
  item: PlaylistItem;
  isSelected: boolean;
  onClick: React.MouseEventHandler;
}

const PanelPlaylistItem = ({
  item,
  isSelected,
  onClick,
}: PanelPlaylistItemProps) => {
  return (
    <li
      className={twMerge(
        'py-1 px-2 cursor-default',
        isSelected ? 'bg-sky-100 text-sky-600' : 'hover:bg-gray-100',
      )}
      onClick={onClick}
    >
      {item.title}
    </li>
  );
};

export default PanelPlaylistItem;
