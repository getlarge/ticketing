export type ReplacementValues = {
  [P in string]: string | number | boolean | ReplacementValues;
};
