import {
  Category,
  EmployeesDocument,
  Priority,
  Source,
  SuggestionsDocument,
  SuggestionStatus,
} from "../../gql/generated";

const mockSuggestions = [
  {
    id: "1",
    employeeId: "emp-1",
    employeeName: "John Doe",
    source: Source.Admin,
    category: Category.Exercise,
    description: "Regular exercise routine",
    status: SuggestionStatus.Pending,
    priority: Priority.High,
    dateCreated: "2024-01-01T00:00:00.000Z",
    dateUpdated: "2024-01-01T00:00:00.000Z",
    dateCompleted: null,
    notes: "",
    createdBy: "Admin",
    __typename: "Suggestion" as const,
  },
  {
    id: "2",
    employeeId: "emp-2",
    employeeName: "Jane Smith",
    source: Source.Admin,
    category: Category.Equipment,
    description: "Ergonomic chair needed",
    status: SuggestionStatus.InProgress,
    priority: Priority.Medium,
    dateCreated: "2024-01-02T00:00:00.000Z",
    dateUpdated: "2024-01-02T00:00:00.000Z",
    dateCompleted: null,
    notes: "",
    createdBy: "Admin",
    __typename: "Suggestion" as const,
  },
];

const mockEmployees = [
  {
    id: 'emp-1',
    name: 'John Doe',
    department: 'Engineering',
    riskLevel: 'LOW',
  },
  {
    id: 'emp-2',
    name: 'Jane Smith',
    department: 'HR',
    riskLevel: 'MEDIUM',
  },
];

export const mockResolvers = [
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
      },
    },
    result: {
      data: {
        suggestions: mockSuggestions,
      },
    },
  },
];

export const mockResolversWithNoResult = [
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
      },
    },
    result: {
      data: {
        suggestions: [],
      },
    },
  },
];