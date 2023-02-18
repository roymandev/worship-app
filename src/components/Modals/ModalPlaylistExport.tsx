import Button from '@/components/Button';
import BaseModal, { ModalProps } from '@/components/Modals/BaseModal';
import usePlaylist from '@/hooks/usePlaylist';

const ModalPlaylistExport = (props: ModalProps) => {
  const { name, download } = usePlaylist();

  const downloadHandler = () => {
    download();
    props.onClose();
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
          <Button className="ml-1" onClick={props.onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalPlaylistExport;
