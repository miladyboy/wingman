import { inferStage, isValidStage } from '../stage';
import type { Stage } from '../../types/prompt';

describe('stage utilities', () => {
  describe('isValidStage', () => {
    it('returns true for valid stages', () => {
      const stages: Stage[] = ['Opening', 'Continue', 'ReEngage'];
      stages.forEach(stage => {
        expect(isValidStage(stage)).toBe(true);
      });
    });

    it('returns false for invalid values', () => {
      expect(isValidStage('foo')).toBe(false);
      expect(isValidStage(undefined)).toBe(false as any);
      expect(isValidStage(123)).toBe(false as any);
    });
  });

  describe('inferStage', () => {
    it('returns "Continue" when isDraft is true', () => {
      const stage = inferStage([], true);
      expect(stage).toBe('Continue');
    });

    it('returns "Opening" when no history', () => {
      const stage = inferStage([], false);
      expect(stage).toBe('Opening');
    });

    it('returns "ReEngage" when last message from user', () => {
      const stage = inferStage([
        { sender: 'assistant', content: 'hi' },
        { sender: 'user', content: 'yo' }
      ], false);
      expect(stage).toBe('ReEngage');
    });

    it('returns "Continue" otherwise', () => {
      const stage = inferStage([
        { sender: 'user', content: 'hi' },
        { sender: 'assistant', content: 'ok' }
      ], false);
      expect(stage).toBe('Continue');
    });
  });
});
