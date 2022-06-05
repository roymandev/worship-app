import { useAtomValue } from 'jotai';
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
}

export interface TextScreenRef {
  scaleScreen: () => void;
}

const TextScreen = forwardRef<TextScreenRef, TextScreenProps>(
  ({ line }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const defaultSettings = useAtomValue(atomScreenSettings);

    const [scaledStyle, setScaledStyle] = useState<ScreenStyle>();

    const scaleScreen = useCallback(() => {
      if (containerRef.current) {
        setScaledStyle(scaleStyle(containerRef.current, defaultSettings));
      }
    }, [defaultSettings]);

    useEffect(() => {
      scaleScreen();
      window.addEventListener('resize', scaleScreen);
      return () => window.removeEventListener('resize', scaleScreen);
    }, [scaleScreen]);

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
