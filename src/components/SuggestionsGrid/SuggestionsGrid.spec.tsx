import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import SuggestionsGrid from "./SuggestionsGrid";
import {
  mockResolvers,
  mockResolversWithNoResult,
} from "./SuggestionsGrid.fixtures";

// Mock the store
vi.mock("../store/useBoardStore", () => ({
  useBoardStore: vi.fn(() => ({
    filters: {
      q: "",
      status: null,
      category: null,
      priority: null,
    },
    setFilters: vi.fn(),
    columnVisibility: {
      employeeName: true,
      category: true,
      description: true,
      status: true,
      priority: true,
      dateCreated: true,
      source: true,
    },
    toggleColumn: vi.fn(),
    showNotification: vi.fn(),
  })),
}));

// Mock responsive hook
vi.mock("../hooks/useResponsive", () => ({
  default: vi.fn(() => ({
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: true,
  })),
}));

// Mock open hook
vi.mock("../hooks/useOpen", () => ({
  default: vi.fn(() => ({
    isVisible: false,
    open: vi.fn(),
    close: vi.fn(),
  })),
}));

describe("SuggestionsGrid", () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the grid with data", async () => {
      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });

      // Check if descriptions are visible
      expect(screen.getByText("Regular exercise routine")).toBeInTheDocument();
      expect(screen.getByText("Ergonomic chair needed")).toBeInTheDocument();
    });

    it("should show empty state when no suggestions", async () => {
      render(
        <MockedProvider mocks={mockResolversWithNoResult}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("No rows")).toBeInTheDocument();
      });
    });

    it("should render column visibility button", () => {
      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      expect(
        screen.getByRole("button", { name: /columns/i })
      ).toBeInTheDocument();
    });
  });

  describe("Row Selection", () => {
    it("should allow selecting individual rows", async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find checkboxes (first one is "select all", rest are row checkboxes)
      const checkboxes = screen.getAllByRole("checkbox");

      // Click first row checkbox (skip the "select all" checkbox)
      await user.click(checkboxes[1]);

      // Checkbox should be checked
      expect(checkboxes[1]).toBeChecked();
    });

    it("should show selection count in footer", async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[1]);

      // Should show "1 selected" in footer
      await waitFor(() => {
        expect(screen.getByText(/1 row selected/i)).toBeInTheDocument();
      });
    });
  });

  describe("Edit Action", () => {
    it("should open action menu when clicking more icon", async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find all "more" buttons
      const moreButtons = screen.getAllByRole("button", { name: "" });
      const firstMoreButton = moreButtons.find((btn) =>
        btn.querySelector('svg[data-testid="MoreHorizIcon"]')
      );

      if (firstMoreButton) {
        await user.click(firstMoreButton);

        // Menu should appear
        await waitFor(() => {
          expect(screen.getByRole("menu")).toBeInTheDocument();
          expect(screen.getByText("Edit")).toBeInTheDocument();
        });
      }
    });
    it("should call onEdit when clicking edit in menu", async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find the row containing "John Doe"
      const johnDoeRow = screen
        .getByText("John Doe")
        .closest('[role="row"]') as HTMLElement;
      expect(johnDoeRow).toBeTruthy();

      // Find the more button within that specific row
      const moreButton = within(johnDoeRow)
        .getAllByRole("button")
        .find((btn) => btn.querySelector("svg"));

      expect(moreButton).toBeTruthy();
      await user.click(moreButton!);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      // Click edit
      await user.click(screen.getByText("Edit"));

      // onEdit should be called with John Doe's suggestion
      expect(mockOnEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          employeeName: "John Doe",
        })
      );
    });
  });

  describe("Column Visibility", () => {
    it("should open column visibility menu when clicking columns button", async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={mockResolvers}>
          <SuggestionsGrid onEdit={mockOnEdit} />
        </MockedProvider>
      );

      const columnsButton = screen.getByRole("button", { name: /columns/i });
      await user.click(columnsButton);

      // Menu should appear with column options
      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });
  });
});
