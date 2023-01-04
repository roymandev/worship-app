import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
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
          <ButtonPrimary className="ml-auto" onClick={downloadHandler}>
            Download
          </ButtonPrimary>
          <ButtonPrimary className="ml-1" onClick={onClose}>
            Cancel
          </ButtonPrimary>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalPlaylistExport;
