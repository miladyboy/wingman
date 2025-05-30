import React from "react";
import { render, screen } from "@testing-library/react";
import ChatMessage from "../ChatMessage";
import type { Message } from "../../utils/messageUtils";

describe("ChatMessage", () => {
  it("renders text and images", () => {
    const message: Message = {
      id: "1",
      sender: "user",
      content: "Hello",
      imageUrls: ["img1.jpg", "img2.jpg"],
    };
    render(<ChatMessage message={message} isUser={true} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getAllByTestId("chat-message-image")).toHaveLength(2);
  });

  it("calls onImageLoad for each image", () => {
    const message: Message = {
      id: "1",
      sender: "user",
      content: "Hi",
      imageUrls: ["img1.jpg", "img2.jpg"],
    };
    const onImageLoad = jest.fn();
    render(
      <ChatMessage message={message} isUser={true} onImageLoad={onImageLoad} />
    );
    const images = screen.getAllByTestId("chat-message-image");
    images.forEach((img) => {
      img.dispatchEvent(new Event("load"));
    });
    expect(onImageLoad).toHaveBeenCalledTimes(2);
  });
});
