import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import FilterButton from '../components/FilterButton';

describe('FilterButton tests', function () {
  it('Check that the count text is correct.', function () {
    render(<FilterButton isPressed={true} count={5} desc={'foo'}/>);
    expect(screen.getByText(/[5]/)).toBeInTheDocument();
  });
});
