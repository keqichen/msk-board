import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/dom"; // Import from here instead
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import SuggestionModal from "./SuggestionModal";
import {
  EmployeesDocument,
  CreateSuggestionDocument,
  UpdateSuggestionDocument,
  Category,
  Priority,
  SuggestionStatus,
  Source,
  SuggestionsDocument,
} from "../../gql/generated";

const mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    department: "Engineering",
    riskLevel: "LOW",
  },
  {
    id: "2",
    name: "Jane Smith",
    department: "HR",
    riskLevel: "MEDIUM",
  },
];

const mockSuggestion = {
  id: "suggestion-1",
  employeeId: "1",
  employeeName: "John Doe",
  source: Source.Admin,
  category: Category.Exercise,
  description: "Test description",
  status: SuggestionStatus.Pending,
  priority: Priority.High,
  dateCreated: "2024-01-01T00:00:00.000Z",
  dateUpdated: "2024-01-01T00:00:00.000Z",
  dateCompleted: null,
  notes: "Test notes",
  createdBy: "Admin",
};

const mockFilters = {
  q: "",
  status: null,
  category: null,
  priority: null,
};

describe("SuggestionModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render create mode correctly", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
          />
        </MockedProvider>
      );

      expect(screen.getByText("Add New Recommendation")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Create a health and safety suggestion for an employee"
        )
      ).toBeInTheDocument();
    });

    it("should show validation errors for required fields", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
          />
        </MockedProvider>
      );

      const submitButton = screen.getByRole("button", {
        name: /create recommendation/i,
      });

      // Submit button should be disabled initially
      expect(submitButton).toBeDisabled();
    });

    it("should validate description length", async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
          />
        </MockedProvider>
      );

      const descriptionInput = screen.getByPlaceholderText(
        "Describe the recommendation..."
      );

      // Type short description
      await user.type(descriptionInput, "Short");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("Description must be at least 10 characters")
        ).toBeInTheDocument();
      });
    });

    it("should successfully create a suggestion", async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
        {
          request: {
            query: SuggestionsDocument,
            variables: {
              q: "",
              status: null,
              category: null,
              priority: null,
            },
          },
          result: {
            data: {
              suggestions: [],
            },
          },
        },
        {
          request: {
            query: CreateSuggestionDocument,
            variables: {
              input: {
                employeeId: "1",
                category: Category.Exercise,
                description: "New recommendation for employee",
                priority: Priority.Medium,
              },
            },
          },
          result: {
            data: {
              createSuggestion: {
                __typename: "Suggestion",
                id: "new-suggestion",
                employeeId: "1",
                employeeName: "John Doe",
                source: Source.Admin,
                category: Category.Exercise,
                description: "New recommendation for employee",
                status: SuggestionStatus.Pending,
                priority: Priority.Medium,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString(),
                dateCompleted: null,
                notes: "",
                createdBy: "Admin",
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
          />
        </MockedProvider>
      );

      // Wait for employees to load
      expect(await screen.findByText("Employee")).toBeInTheDocument();

      // Select employee
      const employeeInput = screen.getByRole("combobox", { name: /employee/i });
      await user.click(employeeInput);
      await user.type(employeeInput, "John");

      await waitFor(() => {
        const option = screen.getByText("John Doe (Engineering)");
        expect(option).toBeInTheDocument();
      });

      await user.click(screen.getByText("John Doe (Engineering)"));

      // Fill description
      const descriptionInput = screen.getByPlaceholderText(
        "Describe the recommendation..."
      );
      await user.type(descriptionInput, "New recommendation for employee");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create recommendation/i,
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Edit Mode", () => {
    it("should render edit mode correctly", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      expect(screen.getByText("Edit Recommendation")).toBeInTheDocument();
      expect(
        screen.getByText("Update the health and safety suggestion")
      ).toBeInTheDocument();
    });

    it("should populate form with existing suggestion data", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue("Test description");
        expect(descriptionInput).toBeInTheDocument();

        const notesInput = screen.getByDisplayValue("Test notes");
        expect(notesInput).toBeInTheDocument();
      });
    });

    it("should disable submit button when form is pristine", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /update recommendation/i,
        });
        expect(submitButton).toBeDisabled();
      });
    });

    it("should enable submit button when form is dirty", async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Test description")
        ).toBeInTheDocument();
      });

      const descriptionInput = screen.getByDisplayValue("Test description");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated description here");

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /update recommendation/i,
        });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should successfully update a suggestion", async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
        {
          request: {
            query: SuggestionsDocument,
            variables: {
              q: "",
              status: null,
              category: null,
              priority: null,
            },
          },
          result: {
            data: {
              suggestions: [],
            },
          },
        },
        {
          request: {
            query: UpdateSuggestionDocument,
            variables: {
              input: {
                id: "suggestion-1",
                employeeId: "1",
                category: Category.Exercise,
                description: "Updated description here",
                priority: Priority.High,
                notes: "Test notes",
                status: SuggestionStatus.Pending,
              },
            },
          },
          result: {
            data: {
              updateSuggestion: {
                ...mockSuggestion,
                description: "Updated description here",
                dateUpdated: new Date().toISOString(),
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Test description")
        ).toBeInTheDocument();
      });

      const descriptionInput = screen.getByDisplayValue("Test description");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Updated description here");

      const submitButton = screen.getByRole("button", {
        name: /update recommendation/i,
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("should disable employee selection in edit mode", async () => {
      const mocks = [
        {
          request: {
            query: EmployeesDocument,
          },
          result: {
            data: {
              employees: mockEmployees,
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <SuggestionModal
            open={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
            filters={mockFilters}
            suggestion={mockSuggestion}
          />
        </MockedProvider>
      );

      await waitFor(() => {
        const employeeInput = screen.getByRole("combobox", {
          name: /employee/i,
        });
        expect(employeeInput).toBeDisabled();
      });
    });
  });
});
