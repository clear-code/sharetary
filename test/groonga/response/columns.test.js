var assert = require('chai').assert;

var Columns = require('../../../lib/groonga/response/columns');

suite('Groonga response Columns', function() {
  var columns;
  setup(function() {
    var source = [
      ['id', 'UInt32'],
      ['name', 'ShortText'],
      ['path', 'ShortText'],
      ['flags', 'ShortText'],
      ['domain', 'ShortText'],
      ['range', 'ShortText'],
      ['default_tokenizer', 'ShortText'],
      ['normalizer', 'ShortText']
    ];
    columns = new Columns(source);
  });

  test('toArray', function() {
    assert.deepEqual(
      columns.toArray(),
      [{name: 'id',                type: 'UInt32',    index: 0},
       {name: 'name',              type: 'ShortText', index: 1},
       {name: 'path',              type: 'ShortText', index: 2},
       {name: 'flags',             type: 'ShortText', index: 3},
       {name: 'domain',            type: 'ShortText', index: 4},
       {name: 'range',             type: 'ShortText', index: 5},
       {name: 'default_tokenizer', type: 'ShortText', index: 6},
       {name: 'normalizer',        type: 'ShortText', index: 7}
      ]
    );
  });

  test('toHash', function() {
    assert.deepEqual(
      columns.toHash(),
      {
       id:     {name: 'id',                type: 'UInt32',    index: 0},
       name:   {name: 'name',              type: 'ShortText', index: 1},
       path:   {name: 'path',              type: 'ShortText', index: 2},
       flags:  {name: 'flags',             type: 'ShortText', index: 3},
       domain: {name: 'domain',            type: 'ShortText', index: 4},
       range:  {name: 'range',             type: 'ShortText', index: 5},
       default_tokenizer:
               {name: 'default_tokenizer', type: 'ShortText', index: 6},
       normalizer:
               {name: 'normalizer',        type: 'ShortText', index: 7}
      }
    );
  });

  test('direct access', function() {
    var arrayVersion = columns.toArray();
    var actual = {};
    var expected = {};
    arrayVersion.forEach(function(column, index) {
      actual[index] = columns[index];
      actual[column.name] = columns[column.name];
      expected[index] = column;
      expected[column.name] = column;
    });
    actual.length = columns.length;
    expected.length = arrayVersion.length;
    assert.deepEqual(actual, expected);
  });

  test('parseRecord', function() {
    var arrayRecord = [
      29,
      'Terms',
      '/path/to/databases/000/db.0000000',
      'TABLE_PAT_KEY|PERSISTENT',
      'ShortText',
      null,
      'TokenBigram',
      'NormalizerAuto'
    ];
    var parsedRecord = columns.parseRecord(arrayRecord);
    assert.deepEqual(
      parsedRecord,
      {
        id:     29,
        name:   'Terms',
        path:   '/path/to/databases/000/db.0000000',
        flags:  'TABLE_PAT_KEY|PERSISTENT',
        domain: 'ShortText',
        range:  null,
        default_tokenizer: 'TokenBigram',
        normalizer: 'NormalizerAuto'
      }
    );
  });
});

