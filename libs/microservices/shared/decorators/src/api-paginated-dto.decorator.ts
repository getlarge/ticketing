import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedDto } from '@ticketing/microservices/shared/models';

export const ApiPaginatedDto = <TModel extends Type<unknown>>(
  model: TModel,
  description = ''
): MethodDecorator => {
  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
