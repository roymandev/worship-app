import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';

const PanelPlaylist = () => (
  <BasePanel>
    <BasePanelHeader>
      <h2 className="px-1">Playlist</h2>

      <ButtonPrimary
        color="gray"
        className="ml-auto h-full py-0"
        withIcon="left"
      >
        <RiUploadLine className="h-4 w-4" />
        Import
      </ButtonPrimary>
      <ButtonPrimary color="gray" className="h-full py-0" withIcon="left">
        <RiDownloadLine className="h-4 w-4" />
        Export
      </ButtonPrimary>
    </BasePanelHeader>
  </BasePanel>
);

export default PanelPlaylist;
