import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ParseQuery<I = any, O = any> implements PipeTransform<I, O> {
  transform(value: I, metadata: ArgumentMetadata): O {
    const { type } = metadata;
    // Make sure to only transform on queries
    if (type === 'query') return this.transformQuery(value);
    return value as unknown as O;
  }

  transformQuery(query: I): O {
    if (typeof query !== 'object' || !query) return query as unknown as O;
    for (const key of Object.keys(query)) {
      if (key.endsWith(']')) {
        const startIndex = key.indexOf('[');
        const endIndex = key.indexOf(']');
        const subKey = key.slice(startIndex + 1, endIndex);
        const k = key.substring(0, startIndex);
        query[k] = { [subKey]: query[key] };
        delete query[key];
      }
    }
    return query as unknown as O;
  }
}
