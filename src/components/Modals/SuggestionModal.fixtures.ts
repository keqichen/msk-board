import {
  Category,
  EmployeesDocument,
  Priority,
  Source,
  SuggestionsDocument,
  SuggestionStatus,
} from "../../gql/generated";

export const mockEmployees = [
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

export const mockSuggestion = {
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

export const mockFilters = {
  q: "",
  status: null,
  category: null,
  priority: null,
};

export const employeeMockResolver = [
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

export const suggestionMockResolver = [
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
];
