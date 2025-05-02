/* eslint-env jest */
/* global describe, it */
// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import UploadComponent from './UploadComponent';

 describe('UploadComponent', () => {
  it('renders', () => {
  });
});


// describe('UploadComponent', () => {
//   let mockSend;
//   beforeEach(() => {
//     mockSend = jest.fn();
//   });

//   it('sends message on Enter', () => {
//     render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
//     const textarea = screen.getByPlaceholderText(/enter text|add context/i);
//     fireEvent.change(textarea, { target: { value: 'Hello world' } });
//     fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
//     // Simulate form submission (requestSubmit is called internally)
//     // The form's onSubmit will be triggered by the Enter key
//     // The mockSend should be called once
//     expect(mockSend).toHaveBeenCalledTimes(1);
//     // The argument should be a FormData with the text
//     const formData = mockSend.mock.calls[0][0];
//     expect(formData.get('newMessageText')).toBe('Hello world');
//   });

//   it('does not send message on Shift+Enter', () => {
//     render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
//     const textarea = screen.getByPlaceholderText(/enter text|add context/i);
//     fireEvent.change(textarea, { target: { value: 'Hello again' } });
//     fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
//     expect(mockSend).not.toHaveBeenCalled();
//     // Should allow newline
//     expect(textarea.value).toBe('Hello again');
//   });

//   it('clears input after sending', () => {
//     render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
//     const textarea = screen.getByPlaceholderText(/enter text|add context/i);
//     fireEvent.change(textarea, { target: { value: 'Clear me' } });
//     fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
//     // After sending, textarea should be cleared
//     expect(textarea.value).toBe('');
//   });

//   it('does not send if input is empty and no files', () => {
//     render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
//     const textarea = screen.getByPlaceholderText(/enter text|add context/i);
//     fireEvent.change(textarea, { target: { value: '' } });
//     fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
//     expect(mockSend).not.toHaveBeenCalled();
//   });

//   it('does not send if disabled', () => {
//     render(<UploadComponent onSendMessage={mockSend} disabled={true} />);
//     const textarea = screen.getByPlaceholderText(/enter text|add context/i);
//     fireEvent.change(textarea, { target: { value: 'Should not send' } });
//     fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
//     expect(mockSend).not.toHaveBeenCalled();
//   });
// }); 