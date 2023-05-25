import { createPostMock } from '@demo-t3/test-utils';

import { parsePosts } from '../post';

describe('Post parsers', () => {
  test('should parse posts', () => {
    const result = parsePosts([createPostMock()]);

    expect(result).toEqual([createPostMock()]);
  });
});
