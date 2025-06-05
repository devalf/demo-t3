import { DBProduct, DBProductDetailed } from '@demo-t3/models';

import { parseProduct, parseProductDetailed } from '../product-parsers';

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
      picture: 'p',
      company: 'c',
      about: 'a',
      extraProperty: 'X',
    };

    expect(parseProduct(obj)).toEqual({
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: 'p',
      company: 'c',
      about: 'a',
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
        picture: 'p',
        company: 'c',
        about: 'a',
        extraProperty: 'X',
      },
      {
        id: '2',
        name: 'B',
        price: 2,
        tags: ['B'],
        timestamp: timestampDate2,
        picture: 'p',
        company: 'c',
        about: 'a',
        extraProperty: 'X',
      },
    ];

    expect(parseProduct(collection[0])).toEqual({
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: 'p',
      company: 'c',
      about: 'a',
    });

    expect(parseProduct(collection[1])).toEqual({
      id: '2',
      name: 'B',
      price: 2,
      tags: ['B'],
      timestamp: '2023-08-02T00:00:00.000Z',
      picture: 'p',
      company: 'c',
      about: 'a',
    });
  });

  test('should parse detailed product correctly', () => {
    const obj: DBProductDetailed = {
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: timestampDate1,
      picture: 'p',
      company: 'c',
      about: 'a',
      specification: 's',
      condition: 'new',
      seller: 's',
      warranty: 'w',
      color: 'c',
      extraProperty: 'X',
    };

    expect(parseProductDetailed(obj)).toEqual({
      id: '1',
      name: 'A',
      price: 1,
      tags: ['A'],
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: 'p',
      company: 'c',
      about: 'a',
      specification: 's',
      condition: 'new',
      seller: 's',
      warranty: 'w',
      color: 'c',
    });
  });
});
