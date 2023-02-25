import { createStyles } from '@mantine/core';
import Split from 'react-split';
import PanelLeft from '../PanelLeft';

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

  return (
    <Split className={classes.split} gutterSize={2}>
      <PanelLeft />
      <div>center</div>
      <div>right</div>
    </Split>
  );
};

export default MainPanels;
