var assert = require('chai').assert;

var TableListResponse = require('../../../lib/groonga/response/table_list');

suite('Groonga response for table_list', function() {
  var source = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    [
      [
        ['id', 'UInt32'],
        ['name', 'ShortText'],
        ['path', 'ShortText'],
        ['flags', 'ShortText'],
        ['domain', 'ShortText'],
        ['range', 'ShortText'],
        ['default_tokenizer', 'ShortText'],
        ['normalizer', 'ShortText']
      ],
      [
        264,
        'Hosts',
        '/path/to/databases/000/db.0000108',
        'TABLE_PAT_KEY|PERSISTENT',
        'ShortText',
        null,
        null,
        null
      ],
      [
        261,
        'Location',
        '/path/to/databases/000/db.0000105',
        'TABLE_PAT_KEY|PERSISTENT',
        'WGS84GeoPoint',
        null,
        null,
        null
      ]
    ]
  ];
  var response;

  setup(function() {
    response = new TableListResponse(source);
  });

  test('columns', function() {
    var expected = [
      {name: 'id',                type: 'UInt32',    index: 0},
      {name: 'name',              type: 'ShortText', index: 1},
      {name: 'path',              type: 'ShortText', index: 2},
      {name: 'flags',             type: 'ShortText', index: 3},
      {name: 'domain',            type: 'ShortText', index: 4},
      {name: 'range',             type: 'ShortText', index: 5},
      {name: 'default_tokenizer', type: 'ShortText', index: 6},
      {name: 'normalizer',        type: 'ShortText', index: 7}
    ];
    assert.deepEqual(response.columns.toArray(), expected);
  });

  test('tables', function() {
    var expected = [
      { id:     264,
        name:   'Hosts',
        path:   '/path/to/databases/000/db.0000108',
        flags:  'TABLE_PAT_KEY|PERSISTENT',
        domain: 'ShortText',
        range:  null,
        default_tokenizer: null,
        normalizer: null },
      { id:     261,
        name:   'Location',
        path:   '/path/to/databases/000/db.0000105',
        flags:  'TABLE_PAT_KEY|PERSISTENT',
        domain: 'WGS84GeoPoint',
        range:  null,
        default_tokenizer: null,
        normalizer: null }
    ];
    assert.deepEqual(response.tables, expected);
  });
});

