import { BaseItemContentLine } from '../types/playlistTypes';

export interface ParsedContentLine extends BaseItemContentLine {
  indexs?: Array<number>;
}

/**
 * Parse content string
 * @param content content string
 * @param noIndex remove line indexs if true
 * @returns parsed content
 */
export const parseContent = (content: string, noIndex = false) => {
  const contentLines = content.split('\n');
  contentLines.push('');
  // Accumulator
  const parsedContent: ParsedContentLine[] = [];
  let lastLine: ParsedContentLine = {
    text: '',
    indexs: [],
  };

  contentLines.forEach((line, index) => {
    if (line) {
      if (lastLine.text) {
        lastLine.text += `\n${line}`;
      } else {
        lastLine.text = line;
      }
      lastLine.indexs?.push(index);
    } else {
      if (lastLine.text) {
        if (lastLine.text.startsWith('#')) {
          lastLine.type = lastLine.text
            .split(' ')[0]
            .toLowerCase()
            .replace('#', '');
        }
        if (noIndex) delete lastLine.indexs;
        parsedContent.push(lastLine);
        lastLine = {
          text: '',
          indexs: [],
        };
      }
    }
  });

  return parsedContent;
};
