import { renderHook, act } from '@testing-library/react';
import useFileUpload from './useFileUpload';

describe('useFileUpload', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('adds files and creates previews', () => {
    const { result } = renderHook(() => useFileUpload());
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.selectedFiles).toHaveLength(1);
    expect(result.current.imagePreviews).toHaveLength(1);
    expect(result.current.imagePreviews[0].url).toBe('blob:mock-url');
  });

  it('removes image and file', () => {
    const { result } = renderHook(() => useFileUpload());
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([file]);
    });
    const id = result.current.imagePreviews[0].id;

    act(() => {
      result.current.removeImage(id);
    });

    expect(result.current.imagePreviews).toHaveLength(0);
    expect(result.current.selectedFiles).toHaveLength(0);
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('clears all files and previews', () => {
    const { result } = renderHook(() => useFileUpload());
    const file1 = new File(['c1'], '1.png', { type: 'image/png' });
    const file2 = new File(['c2'], '2.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([file1, file2]);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.imagePreviews).toHaveLength(0);
    expect(result.current.selectedFiles).toHaveLength(0);
  });
});
