import { useAtom, useAtomValue } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { scaleScreenSize } from '../lib/scaleScreenSize';
import {
  atomBaseScreenSize,
  atomMainScreenSize,
  ScreenStyle,
} from '../stores/screenStore';
import { BaseItemContentLine } from '../types/itemTypes';

interface TextScreenProps {
  line: BaseItemContentLine | null;
  mainScreen?: boolean;
  hideScreen?: boolean;
}

export interface TextScreenRef {
  scaleScreen: () => void;
  scaleMainScreen?: () => void;
}

const TextScreen = forwardRef<TextScreenRef, TextScreenProps>(
  ({ line, mainScreen = false, hideScreen = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const baseScreenSize = useAtomValue(atomBaseScreenSize);
    const [mainScreenSize, setMainScreenSize] = useAtom(atomMainScreenSize);
    const [screenStyle, setScreenStyle] = useState<ScreenStyle>();

    // Scale current screen based on mainScreenSize
    const scaleScreen = () => {
      if (!containerRef.current) return;

      const scaledScreenSize = scaleScreenSize(
        containerRef.current,
        mainScreenSize,
      );
      const scaledScreenStyle = {} as ScreenStyle;
      let key: keyof ScreenStyle;
      for (key in scaledScreenSize) {
        scaledScreenStyle[key] = scaledScreenSize[key] + 'px';
      }
      setScreenStyle(scaledScreenStyle);
    };
    useEffect(scaleScreen, [mainScreenSize]);

    // Scale main screen based on baseScreenSize
    const scaleMainScreen = () => {
      if (!containerRef.current || !mainScreen) return;

      setMainScreenSize({
        ...scaleScreenSize(containerRef.current, baseScreenSize),
        width: window.innerWidth,
        height: window.innerHeight,
      });
      console.log('a');
    };
    useEffect(scaleMainScreen, [baseScreenSize]);

    useImperativeHandle(ref, () => ({
      scaleScreen,
      scaleMainScreen,
    }));

    return (
      <div
        ref={containerRef}
        className="grid overflow-hidden place-items-center w-full h-full font-bold text-center text-white uppercase bg-black"
      >
        {!hideScreen && (
          <div
            className="grid place-items-center whitespace-pre-line bg-gray-800"
            style={screenStyle}
          >
            {!line?.type && line?.text}
          </div>
        )}
      </div>
    );
  },
);

TextScreen.displayName = 'TextScreen';

export default TextScreen;
