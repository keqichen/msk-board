import { SuggestionStatus, Category, Priority, Source } from "../gql/generated";

export const STATUSES: SuggestionStatus[] = [
  SuggestionStatus.Pending,
  SuggestionStatus.InProgress,
  SuggestionStatus.Completed,
  SuggestionStatus.Dismissed,
  SuggestionStatus.Overdue,
];

export const CATEGORIES: Category[] = [
  Category.Exercise,
  Category.Equipment,
  Category.Behavioural,
  Category.Lifestyle,
];

export const PRIORITIES: Priority[] = [
  Priority.High,
  Priority.Medium,
  Priority.Low,
];

export const SOURCES: Source[] = [
  Source.Vida,
  Source.Admin,
];

// Helper to get status color for Chip components
export const getStatusColor = (status: SuggestionStatus) => {
  switch (status) {
    case SuggestionStatus.Completed:
      return "success";
    case SuggestionStatus.InProgress:
      return "info";
    case SuggestionStatus.Dismissed:
      return "default";
    default:
      return "warning";
  }
};