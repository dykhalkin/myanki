import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the environment variables if needed
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_GEMINI_API_KEY: 'test-key',
    },
  },
});

const MOCK_CARDS_RESPONSE = [
  {
    id: 1,
    deckId: 'd1',
    data: {
      f1: 'Fernweh',
      f2: 'Wanderlust / Longing for far-off places',
      f3: 'Ich habe schreckliches Fernweh.',
      f4: 'Das',
      f5: 'Opposite of Heimweh (homesickness).',
    },
    status: 'new',
    nextReview: Date.now(),
  },
  {
    id: 2,
    deckId: 'd1',
    data: {
      f1: 'Zeitgeist',
      f2: 'Spirit of the times',
      f3: 'Der Roman fängt den Zeitgeist der 20er Jahre ein.',
      f4: 'Der',
      f5: 'Compound: Zeit (time) + Geist (spirit)',
    },
    status: 'learning',
    nextReview: Date.now(),
  },
];

beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => MOCK_CARDS_RESPONSE,
  } as Response);
});

test('renders Flashcard Forge title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Flashcard Forge/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders "Add Card" button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add Card/i);
  expect(buttonElement).toBeInTheDocument();
});

test('navigates to study mode when clicking "Study Now"', async () => {
  const user = userEvent.setup();
  render(<App />);
  const studyButton = screen.getByText(/Study Now/i);
  await user.click(studyButton);

  // Check for the "Tap to flip" text which is present in study session cards
  const flipHint = await screen.findByText(/Tap to flip/i);
  expect(flipHint).toBeInTheDocument();
});

test('correct card flipping according to template settings', async () => {
  const user = userEvent.setup();
  render(<App />);

  // 1. Go to Settings
  const settingsButton = screen.getByLabelText(/Edit Template/i);
  await user.click(settingsButton);

  // 2. Modify Template: Remove "Word" (f1) from front, add "Context" (f3) to front
  // There are two columns of checkboxes. We pick the "Front Side" section.
  const frontSideTitle = screen.getByText(/Front Side/i);
  const frontSection = frontSideTitle.closest('div.space-y-3') as HTMLElement;


  const wordCheckbox = within(frontSection).getByText(/Word \(Target Lang\)/i);
  const contextCheckbox = within(frontSection).getByText(/Context \/ Example/i);

  // Initial state: Word is on front (template.front includes 'f1')
  // Click Word to remove it, Click Context to add it
  await user.click(wordCheckbox);
  await user.click(contextCheckbox);

  // 3. Save Changes
  const saveButton = screen.getByText(/Save Changes/i);
  await user.click(saveButton);

  // 4. Start Study Session
  const studyButton = screen.getByText(/Study Now/i);
  await user.click(studyButton);

  // 5. Verify Front Side: Should NOT have "Fernweh" (the word heading), should HAVE context
  // Mock data word is "Fernweh", Mock data context is "Ich habe schreckliches Fernweh."
  const frontFace = screen.getByTestId('front-face');
  // We check for the word specifically as a heading to avoid matching it within the context string
  expect(within(frontFace).queryByRole('heading', { name: 'Fernweh' })).not.toBeInTheDocument();
  expect(within(frontFace).getByText(/Ich habe schreckliches Fernweh./i)).toBeInTheDocument();

  // 6. Flip the card
  const cardArea = screen.getByText(/Tap to flip/i);
  await user.click(cardArea);

  // 7. Verify Back Side: Both should be there (default back template includes f1-f5)
  const backFace = screen.getByTestId('back-face');
  expect(within(backFace).getByRole('heading', { name: 'Fernweh' })).toBeInTheDocument();
  expect(within(backFace).getByText(/Ich habe schreckliches Fernweh./i)).toBeInTheDocument();
});
