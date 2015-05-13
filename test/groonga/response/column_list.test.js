var assert = require('chai').assert;

var ColumnListResponse = require('../../../lib/groonga/response/column_list');

suite('Groonga response for column_list', function() {
  var source = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    [
      [
        ['id', 'UInt32'],
        ['name', 'ShortText'],
        ['path', 'ShortText'],
        ['type', 'ShortText'],
        ['flags', 'ShortText'],
        ['domain', 'ShortText'],
        ['range', 'ShortText'],
        ['source', 'ShortText']
      ],
      [
        256,
        '_key',
        '',
        '',
        'COLUMN_SCALAR',
        'Store',
        'ShortText',
        []
      ],
      [
        258,
        'location',
        '/path/to/databases/000/db.0000102',
        'fix',
        'COLUMN_SCALAR',
        'Store',
        'WGS84GeoPoint',
        []
      ]
    ]
  ];
  var response;

  setup(function() {
    response = new ColumnListResponse(source);
  });

  test('recordDefinition', function() {
    var expected = [
      {name: 'id',     type: 'UInt32',    index: 0},
      {name: 'name',   type: 'ShortText', index: 1},
      {name: 'path',   type: 'ShortText', index: 2},
      {name: 'type',   type: 'ShortText', index: 3},
      {name: 'flags',  type: 'ShortText', index: 4},
      {name: 'domain', type: 'ShortText', index: 5},
      {name: 'range',  type: 'ShortText', index: 6},
      {name: 'source', type: 'ShortText', index: 7}
    ];
    assert.deepEqual(response.recordDefinition.toArray(), expected);
  });

  test('columns', function() {
    var expected = [
      { id:     256,
        name:   '_key',
        path:   '',
        type:   '',
        flags:  'COLUMN_SCALAR',
        domain: 'Store',
        range:  'ShortText',
        source: [] },
      { id:     258,
        name:   'location',
        path:   '/path/to/databases/000/db.0000102',
        type:   'fix',
        flags:  'COLUMN_SCALAR',
        domain: 'Store',
        range:  'WGS84GeoPoint',
        source: [] }
    ];
    assert.deepEqual(response.columns, expected);
  });
});

