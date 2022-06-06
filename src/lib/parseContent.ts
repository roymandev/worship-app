import { BaseItemContentLine } from '../types/playlistTypes';

/**
 * Parse content string
 * @param content content string
 * @returns parsed content
 */
export const parseContent = (content: string) => {
  const contentLines = content.split('\n');
  contentLines.push('');
  // Accumulator
  const parsedContent: BaseItemContentLine[] = [];
  let lastLine: BaseItemContentLine = {
    text: '',
  };

  contentLines.forEach((line) => {
    if (line) {
      if (lastLine.text) {
        lastLine.text += `\n${line}`;
      } else {
        lastLine.text = line;
      }
    } else {
      if (lastLine.text) {
        if (lastLine.text.startsWith('#')) {
          lastLine.type = lastLine.text
            .split(' ')[0]
            .toLowerCase()
            .replace('#', '');
        }
        parsedContent.push(lastLine);
        lastLine = {
          text: '',
        };
      }
    }
  });

  return parsedContent;
};
