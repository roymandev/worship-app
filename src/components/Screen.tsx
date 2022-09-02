import { atomScreenSettings } from '@/stores/screenStore';
import { BaseItemContentLine } from '@/types';
import { useAtomValue } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface ScreenProps {
  line: BaseItemContentLine | null;
}

type ScreenSize = Record<string, unknown>;

export interface ScreenRef {
  resizeScreen: () => void;
}

const Screen = forwardRef<ScreenRef, ScreenProps>(({ line }, ref) => {
  const screenSettings = useAtomValue(atomScreenSettings);
  const [screenStyle, setScreenStyle] = useState<ScreenSize>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeScreen = () => {
    if (!containerRef.current) return;

    const { clientWidth: containerWidth, clientHeight: containerHeight } =
      containerRef.current;

    // Set zoom based on container width
    let zoom = (containerWidth / screenSettings.size.width) * 100;

    // If scaled height is still overflowing, set zoom based on container height
    if ((screenSettings.size.height / 100) * zoom > containerHeight)
      zoom = (containerHeight / screenSettings.size.height) * 100;

    const scaledSize = {} as ScreenSize;

    let key: keyof typeof screenSettings.size;
    for (key in screenSettings.size) {
      scaledSize[key] = (screenSettings.size[key] / 100) * zoom + 'px';
    }

    setScreenStyle(scaledSize);
  };

  useEffect(() => {
    if (containerRef.current) resizeScreen();
  }, [containerRef.current, screenSettings.size]);

  useImperativeHandle(ref, () => ({
    resizeScreen,
  }));

  return (
    <div
      ref={containerRef}
      className="grid flex-1 place-items-center overflow-hidden bg-black font-bold uppercase text-white"
    >
      <p
        className="grid place-items-center whitespace-pre-line bg-gray-800 text-center"
        style={screenStyle}
      >
        {!line?.type && line?.text}
      </p>
    </div>
  );
});

Screen.displayName = 'Screen';

export default Screen;
