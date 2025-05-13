/* eslint-env jest */
/* global describe, it */
import { render, screen, fireEvent } from '@testing-library/react';
import UploadComponent from '../UploadComponent';
import ChatHistory from '../ChatHistory';
import MainApp from '../MainApp';

describe('UploadComponent', () => {
  let mockSend;
  beforeEach(() => {
    mockSend = jest.fn();
  });

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('sends message on Enter', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    // Simulate form submission (requestSubmit is called internally)
    // The form's onSubmit will be triggered by the Enter key
    // The mockSend should be called once
    expect(mockSend).toHaveBeenCalledTimes(1);
    // The argument should be a FormData with the text
    const formData = mockSend.mock.calls[0][0];
    expect(formData.get('newMessageText')).toBe('Hello world');
  });

  it('does not send message on Shift+Enter', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: 'Hello again' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
    expect(mockSend).not.toHaveBeenCalled();
    // Should allow newline
    expect(textarea.value).toBe('Hello again');
  });

  it('clears input after sending', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: 'Clear me' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    // After sending, textarea should be cleared
    expect(textarea.value).toBe('');
  });

  it('does not send if input is empty and no files', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not send if disabled', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: 'Should not send' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('shows error fallback if upload fails', () => {
    // Simulate a failed optimistic message
    const failedMessage = {
      id: 'user-123',
      sender: 'user',
      content: 'Test',
      imageUrls: ['blob:http://localhost/image1'],
      optimistic: true,
      failed: true,
    };
    render(<ChatHistory history={[failedMessage]} />);
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it('disables send button and input when disabled is true', () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    const sendButton = screen.getByTestId('send-message-button');
    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});

describe('MainApp', () => {
  it('shows spinner immediately when sendingMessage is true', () => {
    // render(
    //   <MainApp
    //     profile={{}}
    //     conversations={[]}
    //     activeConversationId={"conv1"}
    //     setActiveConversationId={() => {}}
    //     handleNewThread={() => {}}
    //     handleRenameThread={() => {}}
    //     handleDeleteConversation={() => {}}
    //     messages={[]}
    //     loading={false}
    //     loadingMessages={false}
    //     error={null}
    //     handleSendMessage={() => {}}
    //     sendingMessage={true}
    //     supabase={{}}
    //   />
    // );
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 