import { scaleScreen } from '@/lib/scaleScreen';
import { atomScreenMainSize } from '@/stores/screenStore';
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
}

export interface ScreenRef {
  resizeScreen: () => void;
}

const Screen = forwardRef<ScreenRef, ScreenProps>(({ line, options }, ref) => {
  const screenMainSize = useAtomValue(atomScreenMainSize);
  const [screenStyle, setScreenStyle] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize screen based on container size
  const resizeScreen = () => {
    if (!containerRef.current) return;

    setScreenStyle(
      scaleScreen(screenMainSize, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      }).scaledStyle,
    );
  };

  useEffect(() => {
    if (containerRef.current) resizeScreen();
  }, [containerRef.current, screenMainSize]);

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
          style={screenStyle}
        >
          {!line?.type && !options?.hideText && line?.text}
        </p>
      )}
    </div>
  );
});

Screen.displayName = 'Screen';

export default Screen;
