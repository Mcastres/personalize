import addColumnToTable from '../addColumnToTable';

describe('personalization | contentManagerHooks | addColumnToTable', () => {
  it('does nothing when there s no personalization.personalized key in the action', () => {
    const displayedHeaders = ['one'];
    const layout = {
      contentType: { pluginOptions: {} },
    };

    const result = addColumnToTable({ displayedHeaders, layout });

    expect(result).toHaveProperty('displayedHeaders');
    expect(result).toHaveProperty('layout');
    expect(result.displayedHeaders).toHaveLength(1);
    expect(result.displayedHeaders).toEqual(['one']);
  });

  it('adds a header to the displayedHeaders array when the content type is personalized', () => {
    const displayedHeaders = [];
    const layout = {
      contentType: {
        pluginOptions: {
          personalization: { personalized: true },
        },
      },
    };

    const result = addColumnToTable({ displayedHeaders, layout });

    // The anonymous function of cellFormatter creates problem, because it's anonymous
    // In our scenario, it's even more tricky because we use a closure in order to pass
    // the variations.
    // Stringifying the action allows us to have a name inside the expectation for the "cellFormatter" key
    expect(JSON.stringify(result.displayedHeaders)).toBe(
      '[{"key":"__variation_key__","fieldSchema":{"type":"string"},"metadatas":{"label":"Content available in","searchable":false,"sortable":false},"name":"variations"}]'
    );
  });
});
