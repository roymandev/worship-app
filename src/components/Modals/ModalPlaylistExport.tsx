import Button from '@/components/Button';
import BaseModal, { BaseModalProps } from '@/components/Modals/BaseModal';
import usePlaylist from '@/hooks/usePlaylist';

const ModalPlaylistExport = (
  props: Omit<BaseModalProps, 'title' | 'children'>,
) => {
  const { onClose } = props;
  const { name, download } = usePlaylist();

  const downloadHandler = () => {
    download();
    onClose();
  };

  return (
    <BaseModal title="Export Playlist" {...props}>
      <div className="space-y-3 p-3">
        <p>
          Download &quot;<b>{name || 'Untitled'}.WORSHIP</b>&quot; playlist.
        </p>

        <div className="flex">
          <Button color="blue" className="ml-auto" onClick={downloadHandler}>
            Download
          </Button>
          <Button className="ml-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalPlaylistExport;
