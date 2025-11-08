import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('NotFound page', () => {
  it('renders a 404 message and a home link', () => {
    render(<NotFound />);
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Go back home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});

