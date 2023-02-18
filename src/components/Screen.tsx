import { scaleScreen } from '@/lib/scaleScreen';
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
  options?: {
    hideText?: boolean;
    hideScreen?: boolean;
  };
  mainScreen?: boolean;
}

export interface ScreenRef {
  resizeScreen: () => void;
}

const Screen = forwardRef<ScreenRef, ScreenProps>(
  ({ line, options, mainScreen = false }, ref) => {
    const screenSettings = useAtomValue(atomScreenSettings);
    const [screenStyle, setScreenStyle] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    // Scale screen based on container size
    const resizeScreen = () => {
      if (!containerRef.current) return;

      const containerSizes = {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      };

      setScreenStyle(
        scaleScreen(screenSettings.mainSize, containerSizes).scaledStyle,
      );
    };

    // Resize screen if main screen resized
    useEffect(() => {
      if (!mainScreen) resizeScreen();
    }, [screenSettings.mainSize]);

    useImperativeHandle(ref, () => ({
      resizeScreen,
    }));

    return (
      <div
        ref={containerRef}
        className="grid flex-1 place-items-center overflow-hidden bg-black font-bold uppercase text-white"
      >
        {!options?.hideScreen && (
          <p
            className="grid place-items-center whitespace-pre-line bg-zinc-900 text-center"
            style={{ ...screenStyle, color: screenSettings.textColor }}
          >
            {!line?.type && !options?.hideText && line?.text}
          </p>
        )}
      </div>
    );
  },
);

Screen.displayName = 'Screen';

export default Screen;
