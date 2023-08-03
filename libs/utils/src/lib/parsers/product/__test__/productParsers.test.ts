import { DBProduct } from '@demo-t3/models';

import { parseProduct } from '../productParsers';

describe('Testing productParsers', () => {
  const timestampDate1 = '2023-08-01T00:00:00.000Z';
  const timestampDate2 = '2023-08-02T00:00:00.000Z';

  test('Should parse extended object correctly ', () => {
    const obj: DBProduct = {
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: timestampDate1,
      q: 2,
    };

    expect(parseProduct(obj)).toEqual({
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: '2023-08-01T00:00:00.000Z',
    });
  });

  test('Should parse collection of products correctly', () => {
    const collection = [
      {
        id: '1',
        name: 'A',
        price: 1,
        tags: ['A'],
        timestamp: timestampDate1,
        q: 2,
      },
      {
        id: '2',
        name: 'B',
        price: 2,
        tags: ['B'],
        timestamp: timestampDate2,
        q: 2,
      },
    ];

    expect(parseProduct(collection[0])).toEqual({
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: '2023-08-01T00:00:00.000Z',
    });
    expect(parseProduct(collection[1])).toEqual({
      id: '2',
      name: 'B',
      price: 2,
      tags: ['B'],
      timestamp: '2023-08-02T00:00:00.000Z',
    });
  });
});
