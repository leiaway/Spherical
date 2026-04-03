import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils (cn)', () => {
  it('merges tailwind classes properly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('resolves conflicting tailwind classes using tailwind-merge', () => {
    // text-blue-500 should override text-red-500
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles conditional classes properly', () => {
    const isError = true;
    expect(cn('text-black', isError && 'text-red-500')).toBe('text-red-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['bg-red-500', 'px-4'], 'py-2')).toBe('bg-red-500 px-4 py-2');
  });
});
