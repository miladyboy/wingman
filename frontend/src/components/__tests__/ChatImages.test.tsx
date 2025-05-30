import { render, screen, fireEvent } from "@testing-library/react";
import ChatImages from "../ChatImages";

describe("ChatImages", () => {
  it("renders nothing when no urls", () => {
    const { container } = render(<ChatImages urls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls onImageLoad for each image", () => {
    const handleLoad = jest.fn();
    render(<ChatImages urls={["img1", "img2"]} onImageLoad={handleLoad} />);
    const images = screen.getAllByTestId("chat-message-image");
    images.forEach((img) => {
      fireEvent.load(img);
    });
    expect(handleLoad).toHaveBeenCalledTimes(2);
  });

  it("shows failed overlay when failed", () => {
    render(<ChatImages urls={["img1"]} failed />);
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });
});
