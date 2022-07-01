import mutateSchema, {
  addLocalisationToFields,
  disableAttributesLocalisation,
} from '../mutateCTBContentTypeSchema';

describe('personalization | utils ', () => {
  describe('mutateCTBContentTypeSchema', () => {
    it('should forward the data the pluginOptions.personalization.personalized key does not exist in the content type', () => {
      const data = { pluginOptions: { test: true } };

      expect(mutateSchema(data)).toEqual(data);
    });

    it('should remove the pluginOptions.personalization key from the content type schema', () => {
      const ctSchema = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          personalization: { personalized: false },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {
              personalization: { personalized: true },
            },
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
              personalization: { personalized: true },
            },
          },
        },
      };

      const expected = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {},
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
            },
          },
        },
      };

      expect(mutateSchema(ctSchema, {})).toEqual(expected);
    });

    it('should return the data if the initial schema already has personalization enabled', () => {
      const ctSchema = {
        pluginOptions: {
          pluginA: { foo: 'bar' },
          personalization: { personalized: true },
          pluginB: { foo: 'bar' },
        },
        kind: 'test',
        attributes: {
          one: {
            type: 'string',
            pluginOptions: {
              personalization: { personalized: true },
            },
            required: true,
          },
          two: {
            type: 'number',
            pluginOptions: {
              pluginA: { test: true },
              personalization: { personalized: true },
            },
          },
        },
      };

      expect(
        mutateSchema(ctSchema, {
          schema: {
            pluginOptions: {
              pluginA: { foo: 'bar' },
              personalization: { personalized: true },
              pluginB: { foo: 'bar' },
            },
          },
        })
      ).toEqual(ctSchema);
    });

    it('should set the pluginOptions.personalization.personalized to true an all attributes', () => {
      const nextSchema = {
        pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
        attributes: {
          cover: { type: 'media', pluginOptions: { pluginA: { ok: true } } },
          name: {
            type: 'text',
            pluginOptions: { pluginA: { ok: true }, personalization: { personalized: false } },
          },
          price: {
            type: 'text',
          },
        },
      };
      const expected = {
        pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
        attributes: {
          cover: {
            type: 'media',
            pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
          },
          name: {
            type: 'text',
            pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
          },
          price: {
            type: 'text',
            pluginOptions: { personalization: { personalized: true } },
          },
        },
      };

      expect(mutateSchema(nextSchema, {})).toEqual(expected);
    });
  });

  describe('personalization addLocalisationToFields', () => {
    it('should forward the data if the attribute type is not correct', () => {
      const attributes = {
        foo: { type: 'relation' },
        bar: { type: 'custom' },
      };

      expect(addLocalisationToFields(attributes)).toEqual(attributes);
    });

    it('should keep the pluginOptions for each attribute and enable the personalization.personalized value', () => {
      const attributes = {
        foo: { type: 'text', pluginOptions: { pluginA: { ok: true } }, required: true },
        bar: { type: 'text', pluginOptions: { personalization: { personalized: false } } },
      };

      const expected = {
        foo: {
          type: 'text',
          pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { personalization: { personalized: true } } },
      };

      expect(addLocalisationToFields(attributes)).toEqual(expected);
    });

    it('should enable the pluginOptions.personalization.personalized value for each attribute', () => {
      const attributes = {
        foo: { type: 'text', required: true },
        bar: { type: 'text' },
      };

      const expected = {
        foo: {
          type: 'text',
          pluginOptions: { personalization: { personalized: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { personalization: { personalized: true } } },
      };

      expect(addLocalisationToFields(attributes)).toEqual(expected);
    });
  });

  describe('disableAttributesLocalisation', () => {
    it('should remove the pluginOptions.personalization for all attributes', () => {
      const attributes = {
        foo: {
          type: 'text',
          pluginOptions: { pluginA: { ok: true }, personalization: { personalized: true } },
          required: true,
        },
        bar: { type: 'text', pluginOptions: { personalization: { personalized: true } } },
      };

      const expected = {
        foo: { type: 'text', required: true, pluginOptions: { pluginA: { ok: true } } },
        bar: { type: 'text', pluginOptions: {} },
      };

      expect(disableAttributesLocalisation(attributes)).toEqual(expected);
    });
  });
});
