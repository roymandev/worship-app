import { scaleScreen } from '@/lib/scaleScreen';
import { BaseItemLine } from '@/schemas/itemSchema';
import { atomScreenSettings } from '@/stores/screenStore';
import { Stack, Text } from '@mantine/core';
import { useAtomValue } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface ScreenProps {
  line: BaseItemLine | null;
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
      <Stack
        ref={containerRef}
        sx={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'black',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: 'white',
        }}
      >
        {!options?.hideScreen && (
          <Text
            sx={{
              ...screenStyle,
              color: screenSettings.textColor,
              display: 'grid',
              placeItems: 'center',
              whiteSpace: 'pre-line',
              textAlign: 'center',
              backgroundColor: screenSettings.backgroundColor,
            }}
          >
            {!line?.type && !options?.hideText && line?.text}
          </Text>
        )}
      </Stack>
    );
  },
);

Screen.displayName = 'Screen';

export default Screen;
