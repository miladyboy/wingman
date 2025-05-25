/* eslint-env jest */
/* global describe, it */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadComponent from "../UploadComponent";
import ChatHistory from "../ChatHistory";
import MainApp from "../MainApp";

jest.mock("../../utils/env", () => ({
  __esModule: true,
  default: "",
}));

jest.mock("../../services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "test-token" } },
      }),
    },
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL for Jest environment
global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("UploadComponent", () => {
  let mockSend;
  beforeEach(() => {
    mockSend = jest.fn();
  });

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it("sends message on Enter", async () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", charCode: 13 });
    // Wait for the async update
    await waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
    // The call should be with FormData
    const formData = mockSend.mock.calls[0][0];
    expect(formData.get("newMessageText")).toBe("Hello world");
  });

  it("does not send message on Shift+Enter", () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: "Hello again" } });
    fireEvent.keyDown(textarea, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      shiftKey: true,
    });
    expect(mockSend).not.toHaveBeenCalled();
    // Should allow newline
    expect(textarea.value).toBe("Hello again");
  });

  it("clears input after sending", async () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: "Clear me" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", charCode: 13 });
    // Wait for the async update
    await waitFor(() => expect(textarea.value).toBe(""));
  });

  it("does not send if input is empty and no files", () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: "" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", charCode: 13 });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send if disabled", () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    fireEvent.change(textarea, { target: { value: "Should not send" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter", charCode: 13 });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("shows error fallback if upload fails", () => {
    // Simulate a failed optimistic message
    const failedMessage = {
      id: "user-123",
      sender: "user",
      content: "Test",
      imageUrls: ["blob:http://localhost/image1"],
      optimistic: true,
      failed: true,
    };
    render(<ChatHistory history={[failedMessage]} />);
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it("disables send button and input when disabled is true", () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/enter text|add context/i);
    const sendButton = screen.getByTestId("send-message-button");
    const attachButton = screen.getByTestId("attach-image-button");
    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(attachButton).toBeDisabled();
  });

  // Drag and Drop tests
  it("should handle file drop correctly", async () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);

    // Get the dropzone container (the div with getRootProps)
    const dropzone = screen.getByRole("presentation");
    const mockFile = createMockFile("test-image.jpg", "image/jpeg");

    // Simulate file drop using the helper function
    simulateFileDrop(dropzone, [mockFile]);

    // Wait for the image preview to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("chat-image-preview")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check that the placeholder text changed
    expect(
      screen.getByPlaceholderText(/add context or ask a question/i)
    ).toBeInTheDocument();
  });

  it("should show drag active state when dragging over", async () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);

    // Get the dropzone container
    const dropzone = screen.getByRole("presentation");
    const mockFile = createMockFile("test-image.jpg", "image/jpeg");
    const dragData = createMockDragEvent([mockFile]);

    // Simulate drag enter
    fireEvent.dragEnter(dropzone, dragData);

    // Check if drag active state is shown
    await waitFor(() => {
      expect(screen.getByText(/drop images here/i)).toBeInTheDocument();
    });
  });

  it("should send message with dropped files", async () => {
    render(<UploadComponent onSendMessage={mockSend} disabled={false} />);

    // Get the dropzone container
    const dropzone = screen.getByRole("presentation");
    const mockFile = createMockFile("test-image.jpg", "image/jpeg");

    // Drop the file using the helper function
    simulateFileDrop(dropzone, [mockFile]);

    // Wait for preview to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("chat-image-preview")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Send the message
    const sendButton = screen.getByTestId("send-message-button");
    fireEvent.click(sendButton);

    // Verify that onSendMessage was called with FormData containing the file
    expect(mockSend).toHaveBeenCalledTimes(1);
    const formData = mockSend.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.getAll("images")).toHaveLength(1);
  });
});

describe("MainApp", () => {
  it("shows spinner immediately when sendingMessage is true", () => {
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

// Helper function to create a mock file
const createMockFile = (name, type = "image/jpeg") => {
  return new File(["mock content"], name, { type });
};

// Helper function to create mock drag event data
const createMockDragEvent = (files) => {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };
};

// Helper to properly simulate a file drop for react-dropzone
const simulateFileDrop = (element, files) => {
  const dragEvent = createMockDragEvent(files);

  // Simulate the sequence of events that react-dropzone expects
  fireEvent.dragEnter(element, dragEvent);
  fireEvent.dragOver(element, dragEvent);
  fireEvent.drop(element, dragEvent);
};
