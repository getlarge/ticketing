export type SupportedProjectTypes = 'app' | 'lib';

export const supportedProjectTypes: SupportedProjectTypes[] = ['app', 'lib'];

export function isSupportedProjectType(x: unknown): x is SupportedProjectTypes {
  return (
    typeof x === 'string' &&
    supportedProjectTypes.includes(x as SupportedProjectTypes)
  );
}
