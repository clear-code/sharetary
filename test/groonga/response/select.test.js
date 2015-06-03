var assert = require('chai').assert;

var SelectResponse = require('../../../lib/groonga/response/select');

suite('Groonga response for select', function() {
  var source = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    [
      [
        [20],
        [['_id', 'UInt32'],
         ['_key', 'ShortText'],
         ['tags', 'ShortText'],
         ['languages', 'ShortText']],
        [2, 'Groonga', ['Groonga'], ['C']],
        [3, 'Droonga', ['Groonga', 'Droonga'], ['Ruby', 'JavaScript']]
      ],
      [
        [2],
        [['_key', 'ShortText'],
         ['_nsubrecs', 'Int32']],
        ['Groonga', 2],
        ['Droonga', 1]
      ],
      [
        [3],
        [['_key', 'ShortText'],
         ['_nsubrecs', 'Int32']],
        ['C', 1],
        ['Ruby', 1],
        ['JavaScript', 1]
      ]
    ]
  ];

  test('count', function() {
    var response = new SelectResponse(source);
    assert.equal(response.count, 20);
  });

  test('records', function() {
    var response = new SelectResponse(source);
    var expected = [
      {_id: 2, _key: 'Groonga', tags: ['Groonga'], languages: ['C']},
      {_id: 3, _key: 'Droonga', tags: ['Groonga', 'Droonga'], languages: ['Ruby', 'JavaScript']}
    ];
    assert.deepEqual(response.records, expected);
  });

  test('drolldownResults', function() {
    var response = new SelectResponse(source);
    var actual = [];
    response.drilldownResults.forEach(function(result) {
      actual.push({ count: result.count,
                    records: result.records });
    });
    var expected = [
      {count: 2, records: [
         {_key: 'Groonga', _nsubrecs: 2},
         {_key: 'Droonga', _nsubrecs: 1}
       ]},
      {count: 3, records: [
         {_key: 'C', _nsubrecs: 1},
         {_key: 'Ruby', _nsubrecs: 1},
         {_key: 'JavaScript', _nsubrecs: 1}
       ]}
    ];
    assert.deepEqual(actual, expected);
  });
});

