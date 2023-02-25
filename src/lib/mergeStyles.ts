import { createStyles, CSSObject, DefaultProps } from '@mantine/core';

// Merge mantine.dev Styles API
export const mergeStyles = <StylesNames extends string = never>(
  ...styles: DefaultProps<StylesNames>['styles'][]
) => {
  const useStyles = createStyles((theme) =>
    styles.reduce((result, current) => {
      if (typeof current === 'function') {
        return mergeObjects(result, current(theme, {}));
      } else if (current) {
        return mergeObjects(result, current);
      } else return result;
    }, {}),
  );

  return useStyles();
};

type Obj = Partial<Record<string, CSSObject>>;

const mergeObjects = (firstObj: Obj, secondObj: Obj): Obj => {
  const result: Obj = {};
  const allKeys = [...Object.keys(firstObj), ...Object.keys(secondObj)];
  for (const key of allKeys) {
    result[key] = { ...firstObj[key], ...secondObj[key] };
  }
  return result;
};
