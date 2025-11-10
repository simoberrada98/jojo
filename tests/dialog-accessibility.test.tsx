import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

expect.extend(toHaveNoViolations);

describe('Dialog accessibility', () => {
  it('associates content with title and description via aria', async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByRole('dialog');
    const labelledBy = content.getAttribute('aria-labelledby');
    const describedBy = content.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    const title = document.getElementById(labelledBy!);
    const desc = document.getElementById(describedBy!);
    expect(title?.textContent).toContain('Test Title');
    expect(desc?.textContent).toContain('Test Description');

    const results = await axe(content);
    expect(results).toHaveNoViolations();
  });

  it('provides visually hidden labels when title and description are absent', async () => {
    render(
      <Dialog open>
        <DialogContent>
          <div>Inner content</div>
        </DialogContent>
      </Dialog>
    );
    const content = screen.getByRole('dialog');
    const labelledBy = content.getAttribute('aria-labelledby');
    const describedBy = content.getAttribute('aria-describedby');
    const title = labelledBy ? document.getElementById(labelledBy) : null;
    const desc = describedBy ? document.getElementById(describedBy) : null;
    expect(title).toBeTruthy();
    expect(desc).toBeTruthy();
    expect(title?.className).toContain('sr-only');
    expect(desc?.className).toContain('sr-only');

    const results = await axe(content);
    expect(results).toHaveNoViolations();
  });
});

