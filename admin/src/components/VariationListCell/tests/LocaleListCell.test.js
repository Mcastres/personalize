import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { ThemeProvider, lightTheme } from '@strapi/design-system';
import VariationListCell from '../VariationListCell';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => []),
}));

describe('VariationListCell', () => {
  it('returns the default variation first, then the others sorted alphabetically', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    useSelector.mockImplementation(() => variations);

    const variation = 'en';
    const personalizations = [{ variation: 'fr-FR' }, { locale: 'ar' }];

    render(
      <IntlProvider messages={{}} variation="en">
        <ThemeProvider theme={lightTheme}>
          <VariationListCell id={12} variations={variations} locale={locale} personalizations={personalizations} />
        </ThemeProvider>
      </IntlProvider>
    );

    expect(screen.getByText('French (default), Arabic, English')).toBeVisible();
  });

  it('returns the "ar" when there s 2 variations available', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    useSelector.mockImplementation(() => variations);

    const variation = 'en';
    const personalizations = [{ variation: 'ar' }];

    render(
      <IntlProvider messages={{}} variation="en">
        <ThemeProvider theme={lightTheme}>
          <VariationListCell id={12} variations={variations} locale={locale} personalizations={personalizations} />
        </ThemeProvider>
      </IntlProvider>
    );

    expect(screen.getByText('Arabic, English')).toBeVisible();
  });

  it('returns the "ar" and "en" variations  alphabetically sorted', () => {
    const variations = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        createdAt: '2021-03-09T14:57:03.016Z',
        updatedAt: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French',
        code: 'fr-FR',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Arabic',
        code: 'ar',
        createdAt: '2021-03-09T15:03:06.992Z',
        updatedAt: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];
    useSelector.mockImplementation(() => variations);

    const variation = 'fr-FR';
    const personalizations = [{ variation: 'en' }, { locale: 'ar' }];

    render(
      <IntlProvider messages={{}} variation="en">
        <ThemeProvider theme={lightTheme}>
          <VariationListCell id={12} variations={variations} locale={locale} personalizations={personalizations} />
        </ThemeProvider>
      </IntlProvider>
    );

    expect(screen.getByText('French (default), Arabic, English')).toBeVisible();
  });
});
