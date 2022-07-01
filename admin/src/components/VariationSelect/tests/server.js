import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('*/personalization/iso-variations', (req, res, ctx) => {
    const defaultVariations = [
      {
        code: 'af',
        name: 'Afrikaans (af)',
      },
      {
        code: 'en',
        name: 'English (en)',
      },
      {
        code: 'fr',
        name: 'French (fr)',
      },
    ];

    return res(ctx.json(defaultVariations));
  }),
  rest.get('*/personalization/variations', (req, res, ctx) => {
    const defaultVariations = [
      {
        code: 'en',
        name: 'English (en)',
        id: 2,
        isDefault: true,
      },
    ];

    return res(ctx.json(defaultVariations));
  })
);

export default server;
