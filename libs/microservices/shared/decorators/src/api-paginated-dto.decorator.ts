import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedDto } from '@ticketing/microservices/shared/models';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ApiPaginatedDto = <TModel extends Type<unknown>>(
  model: TModel,
  description = ''
) => {
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
