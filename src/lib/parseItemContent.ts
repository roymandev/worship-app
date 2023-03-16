import { BaseItemLine } from '@/schemas/itemSchema';

export interface ParsedContentLine extends BaseItemLine {
  indexs?: Array<number>;
}

/**
 * Parse item content string
 * @param content content string
 * @param withIndex add line indexs if true
 * @returns parsed content
 */
export const parseItemContent = (content: string, withIndex = false) => {
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
        if (!withIndex) delete lastLine.indexs;
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
