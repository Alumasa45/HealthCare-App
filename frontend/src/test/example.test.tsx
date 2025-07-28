import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Simple test component
const TestComponent = () => {
  return <div>Hello World</div>;
};

describe("Test Setup", () => {
  it("should render a component", () => {
    render(<TestComponent />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should have vi available as a mock function", () => {
    const mockFn = vi.fn();
    mockFn("test");
    expect(mockFn).toHaveBeenCalledWith("test");
  });
});
