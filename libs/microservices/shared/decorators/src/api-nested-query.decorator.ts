import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  ApiQueryOptions,
  getSchemaPath,
} from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/ban-types
function getDecorators(fn: Function) {
  const constructor = fn.prototype;
  const properties = Reflect.getMetadata(
    'swagger/apiModelPropertiesArray',
    constructor
  ).map((prop) => prop.substr(1));

  return properties.flatMap((property) => {
    const propertyType = Reflect.getMetadata(
      'design:type',
      constructor,
      property
    );
    const meta = Reflect.getMetadata(
      'swagger/apiModelProperties',
      constructor,
      property
    );
    const subClass = meta.type();

    if (typeof subClass === 'function') {
      const query: ApiQueryOptions = {
        required: meta.required,
        name: property,
        // type: 'object',
        style: 'deepObject',
        explode: meta.isArray,
        schema: meta.isArray
          ? { type: 'array', items: { $ref: getSchemaPath(subClass) } }
          : { $ref: getSchemaPath(propertyType) },
      };
      return [ApiExtraModels(subClass), ApiQuery(query)];
    } else {
      return [
        ApiQuery({
          name: property,
          type: typeof subClass,
          required: meta.required,
        }),
      ];
    }
  });
}

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/explicit-function-return-type
export function ApiNestedQuery(query: Function) {
  const decorators = getDecorators(query);
  return applyDecorators(...decorators);
}
