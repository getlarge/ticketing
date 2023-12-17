import { get as lodashGet } from 'lodash-es';

import { TwoWayMap } from '../util/two-way-map.js';
import type { ReplaceableString } from './relation-tuple-with-replacements.js';
import type { ReplacementValues } from './replacement-values.js';

function findReplacementsInString<T extends ReplacementValues>(
  str: string,
  possibleReplacements: TwoWayMap<keyof T, string>,
): Array<{ start: number; endExcl: number; prop: keyof T }> {
  const regexStr = `(${Array.from(possibleReplacements.values()).join('|')})`;
  const regex = new RegExp(regexStr, 'g');

  return Array.from(str.matchAll(regex)).flatMap((x) => {
    if (x.index == null) {
      return [];
    }

    const value = x.values().next().value;
    return [
      {
        start: x.index,
        endExcl: x.index + value.length,
        prop: possibleReplacements.getByValue(value) as keyof T,
      },
    ];
  });
}

function generateReplacerFunctions<T extends ReplacementValues>(
  sortedFoundReplacements: Array<{
    start: number;
    endExcl: number;
    prop: keyof T;
  }>,
  str: string,
): Array<ReplaceableString<T>> {
  const resultStringParts: Array<ReplaceableString<T>> = [];

  let pos = 0;
  sortedFoundReplacements.forEach(({ start, endExcl, prop }) => {
    const strPart = str.substring(pos, Math.max(0, start)); // let calculation happen before
    resultStringParts.push(() => strPart);
    resultStringParts.push((replacements) =>
      String(lodashGet(replacements, prop)),
    );

    pos = endExcl;
  });

  if (pos < str.length) {
    const strPart = str.substring(pos, str.length);
    resultStringParts.push(() => strPart);
  }
  return resultStringParts;
}

export const generateReplacerFunction = <T extends ReplacementValues>(
  str: string,
  possibleReplacements: TwoWayMap<keyof T, string>,
): ReplaceableString<T> => {
  const foundReplacements = findReplacementsInString(str, possibleReplacements);

  const hasNoReplacements = foundReplacements.length === 0;
  const isWholeStringReplacement =
    foundReplacements.length === 1 &&
    foundReplacements[0].start === 0 &&
    foundReplacements[0].endExcl === str.length;

  if (hasNoReplacements) {
    return () => str;
  } else if (isWholeStringReplacement) {
    return (replacements) =>
      String(lodashGet(replacements, foundReplacements[0].prop));
  }

  const foundReplacementsSortedByStartIndexASC = foundReplacements.sort(
    (a, b) => a.start - b.start,
  );

  const resultStringParts = generateReplacerFunctions(
    foundReplacementsSortedByStartIndexASC,
    str,
  );

  return (replacements) => {
    return resultStringParts.map((x) => x(replacements)).join('');
  };
};
