import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Simple test component
const TestComponent = () => {
  return <div>Hello World</div>;
};

describe("Test Setup", () => {
  it("should render a component", () => {
    render(<TestComponent />);
    expect(screen.getByText("Hello World")).toBeDefined();
  });

  it("should have vi available as a mock function", () => {
    const mockFn = vi.fn();
    mockFn("test");
    expect(mockFn).toHaveBeenCalledWith("test");
  });
});
