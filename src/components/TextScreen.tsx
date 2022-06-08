import { useAtom } from 'jotai';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { scaleStyle } from '../lib/scaleStyle';
import { atomScreenSettings, ScreenStyle } from '../stores/screenStore';
import { BaseItemContentLine } from '../types/playlistTypes';

interface TextScreenProps {
  line: BaseItemContentLine | null;
  mainScreen?: boolean;
}

export interface TextScreenRef {
  scaleScreen: () => void;
}

const TextScreen = forwardRef<TextScreenRef, TextScreenProps>(
  ({ line, mainScreen }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [defaultSettings, setDefaultSettings] = useAtom(atomScreenSettings);

    const [scaledStyle, setScaledStyle] = useState<ScreenStyle>();

    const scaleScreen = useCallback(() => {
      if (containerRef.current) {
        setScaledStyle(scaleStyle(containerRef.current, defaultSettings));
      }
    }, [defaultSettings]);

    const scaleToMainScreen = () => {
      setDefaultSettings({
        ...defaultSettings,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    useEffect(() => {
      scaleScreen();

      if (mainScreen) {
        window.addEventListener('resize', scaleToMainScreen);
        return () => window.removeEventListener('resize', scaleToMainScreen);
      }
    }, [defaultSettings]);

    useImperativeHandle(ref, () => ({
      scaleScreen,
    }));

    return (
      <div
        ref={containerRef}
        className="grid overflow-hidden place-items-center w-full h-full font-bold text-center text-white uppercase bg-black"
      >
        <div
          className="grid place-items-center whitespace-pre-line bg-gray-800"
          style={scaledStyle}
        >
          {!line?.type && line?.text}
        </div>
      </div>
    );
  },
);

TextScreen.displayName = 'TextScreen';

export default TextScreen;
