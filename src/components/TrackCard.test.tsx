import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TrackCard } from './TrackCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock AddToPlaylistButton to avoid needing full query and auth context in a simple presentational test
vi.mock('./AddToPlaylistButton', () => ({
  AddToPlaylistButton: () => <button data-testid="add-button">Add</button>,
}));

describe('TrackCard', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockTrack = {
    id: 't-1',
    title: 'Awesome Song',
    play_count: 1500000,
    cultural_context: 'Traditional folk fusion',
    audio_url: null,
    cover_image_url: null,
    duration_seconds: null,
    artist: { id: 'a-1', name: 'Cool Band', is_emerging: true },
    genre: { id: 'g-1', name: 'Fusion' },
  };

  it('renders track info correctly', () => {
    render(<TrackCard track={mockTrack} index={4} />, { wrapper });
    
    // Check title, artist, genre, index
    expect(screen.getByText('Awesome Song')).toBeInTheDocument();
    expect(screen.getByText('Cool Band')).toBeInTheDocument();
    expect(screen.getByText('Fusion')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // index + 1
  });

  it('formats play count correctly in millions', () => {
    render(<TrackCard track={mockTrack} />, { wrapper });
    // 1500000 should be formatted as 1.5M
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });

  it('displays emerging artist badge if artist is emerging', () => {
    render(<TrackCard track={mockTrack} />, { wrapper });
    expect(screen.getByText('Rising')).toBeInTheDocument();
  });

  it('renders AddToPlaylistButton mock', () => {
    render(<TrackCard track={mockTrack} />, { wrapper });
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });
});
