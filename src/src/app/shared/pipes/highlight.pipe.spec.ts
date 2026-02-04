
import { HighlightPipe } from './highlight.pipe';

fdescribe('HighlightPipe', () => {
  let pipe: HighlightPipe;

  beforeEach(() => {
    pipe = new HighlightPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the original value if value is null', () => {
    const result = pipe.transform(null, 'test');
    expect(result).toBeNull();
  });

  it('should return the original value if searchText is null', () => {
    const result = pipe.transform('Angular Pipe', '');
    expect(result).toBe('Angular Pipe');
  });

  it('should return the original value if both value and searchText are empty', () => {
    const result = pipe.transform('', '');
    expect(result).toBe('');    
  });
  it('should be case insensitive',()=>{
    const result=pipe.transform('Angular Highlight Pipe','highlight');
    expect(result).toBe('Angular <mark>Highlight</mark> Pipe');
  });

  it('should highlight multiple occurrences of the search text', () => {
    const result = pipe.transform('test TEST TeSt', 'test');
    const expected = '<mark>test</mark> <mark>TEST</mark> <mark>TeSt</mark>';
    expect(result).toBe(expected);
  });

  it('should escape special regex characters in searchText', () => {
    const result = pipe.transform('Angular (Pipe)', '(Pipe)');
    expect(result).toContain('<mark>(Pipe)</mark>');
  });

  it('should convert non-string value to string before processing', () => {
    const result = pipe.transform(12345, '123');
    expect(result).toContain('<mark>123</mark>');
  });
});
