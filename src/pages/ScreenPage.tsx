import { useAtomValue } from 'jotai';
import TextScreen from '../components/TextScreen';
import { atomLiveItemSelectedLine } from '../stores/liveStore';

const ScreenPage = () => {
  const liveItemSelectedLine = useAtomValue(atomLiveItemSelectedLine);
  return (
    <div className="h-screen">
      <TextScreen line={liveItemSelectedLine} mainScreen />
    </div>
  );
};

export default ScreenPage;
