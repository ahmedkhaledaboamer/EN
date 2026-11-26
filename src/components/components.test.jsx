import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import McqExercise from './practice/McqExercise';
import OrderExercise from './practice/OrderExercise';
import Saved from '../pages/Saved';
import { STORAGE_KEYS } from '../utils/storage';

beforeEach(() => localStorage.clear());

describe('McqExercise', () => {
  const exercise = { type: 'mcq', question: '___ milk do we need?', options: ['How many', 'How much'], answer: 'How much' };

  it('reports a correct answer', () => {
    const onSubmit = vi.fn();
    render(<McqExercise exercise={exercise} locked={false} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /How much/ }));
    expect(onSubmit).toHaveBeenCalledWith({ correct: true, given: 'How much' });
  });

  it('reports a wrong answer', () => {
    const onSubmit = vi.fn();
    render(<McqExercise exercise={exercise} locked={false} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /How many/ }));
    expect(onSubmit).toHaveBeenCalledWith({ correct: false, given: 'How many' });
  });
});

describe('OrderExercise', () => {
  it('builds the sentence from tapped words', () => {
    const exercise = { type: 'order', words: ['card?', 'pay', 'Can', 'by', 'I'], answer: 'Can I pay by card?' };
    const onSubmit = vi.fn();
    render(<OrderExercise exercise={exercise} locked={false} onSubmit={onSubmit} />);
    const bank = screen.getByLabelText('Available words');
    ['Can', 'I', 'pay', 'by', 'card?'].forEach((w) => fireEvent.click(within(bank).getByRole('button', { name: w })));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(onSubmit).toHaveBeenCalledWith({ correct: true, given: 'Can I pay by card?' });
  });
});

describe('Saved page', () => {
  const renderSaved = () =>
    render(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>,
    );

  it('shows an empty state', () => {
    renderSaved();
    expect(screen.getByText(/No saved words/)).toBeTruthy();
  });

  it('groups saved words by source and can remove one', () => {
    localStorage.setItem(
      STORAGE_KEYS.savedWords,
      JSON.stringify([
        { slug: 'supermarket', en: 'cashier', ar: 'كاشير', savedAt: '2026-11-01' },
        { slug: 'essentials/possessives', en: 'mine', ar: 'بتاعي', savedAt: '2026-11-02' },
      ]),
    );
    renderSaved();
    expect(screen.getByRole('link', { name: 'Supermarket' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Possessives' })).toBeTruthy();
    expect(screen.getByText('2 words · from topics and essentials')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Remove "mine" from saved words' }));
    expect(screen.queryByText('mine')).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.savedWords))).toHaveLength(1);
  });
});
