import cleanData from '../cleanData';

describe('personalization | Components | CMEditViewCopyVariation | utils', () => {
  describe('cleanData', () => {
    it('should change the personalization key with the one passed in the argument', () => {
      const data = {
        address: 'test',
        addresseses: [],
        common: 'common',
        createdAt: '2021-03-17T15:34:05.866Z',
        createdBy: {
          blocked: null,
          email: 'cyril@strapi.io',
          firstname: 'cyril',
          id: 1,
          isActive: true,
          lastname: 'lopez',
          preferedLanguage: null,
          registrationToken: null,
          resetPasswordToken: null,
          username: null,
        },
        id: 14,
        variation: 'fr-FR',
        personalizations: [
          {
            id: 13,
            variation: 'en',
            publishedAt: null,
          },
        ],
        name: 'name',
        publishedAt: null,
        updatedAt: '2021-03-17T15:34:18.958Z',
        updatedBy: {
          blocked: null,
          email: 'cyril@strapi.io',
          firstname: 'cyril',
          id: 1,
          isActive: true,
          lastname: 'lopez',
          preferedLanguage: null,
          registrationToken: null,
          resetPasswordToken: null,
          username: null,
        },
      };
      const contentType = {
        attributes: {
          address: { type: 'relation' },
          addresseses: { type: 'relation' },
          common: { pluginOptions: { personalization: { personalized: true } }, type: 'text' },
          createdAt: { type: 'timestamp' },
          id: { type: 'integer' },
          name: { pluginOptions: { personalization: { personalized: true } } },
          updatedAt: { type: 'timestamp' },
        },
      };
      const initLocalizations = [
        {
          id: 14,
          variation: 'fr-FR',
          publishedAt: null,
        },
      ];

      const expected = {
        common: 'common',
        variation: 'fr-FR',
        personalizations: [
          {
            id: 14,
            variation: 'fr-FR',
            publishedAt: null,
          },
        ],
        name: 'name',
      };

      expect(cleanData(data, { contentType, components: {} }, initLocalizations)).toEqual(expected);
    });
  });
});
