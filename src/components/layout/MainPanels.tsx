import { createStyles } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { useRef } from 'react';
import Split from 'react-split';
import PanelLeft from '../PanelLeft';
import PanelLive from '../PanelLive';
import PanelPreview from '../PanelPreview';
import { ScreenRef } from '../Screen';

const useStyles = createStyles((theme) => ({
  split: {
    display: 'flex',
    height: '100vh',
    '& .gutter': { backgroundColor: theme.colors.dark[4] },
    '& .gutter:hover': { backgroundColor: theme.colors.dark[3] },
    '& .gutter-horizontal:hover': {
      cursor: 'col-resize',
    },
    '& .gutter-vertical:hover': {
      cursor: 'row-resize',
    },
  },
}));

const MainPanels = () => {
  const { classes } = useStyles();

  const panelPreviewScreenRef = useRef<ScreenRef | null>(null);
  const panelLiveScreenRef = useRef<ScreenRef | null>(null);

  const dragHandler = () => {
    panelPreviewScreenRef.current?.resizeScreen();
    panelLiveScreenRef.current?.resizeScreen();
  };

  useWindowEvent('resize', dragHandler);

  return (
    <Split className={classes.split} gutterSize={2} onDrag={dragHandler}>
      <PanelLeft />
      <PanelPreview ref={panelLiveScreenRef} />
      <PanelLive ref={panelLiveScreenRef} />
    </Split>
  );
};

export default MainPanels;
