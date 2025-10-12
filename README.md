# MSK Suggestions Management Board

A web application for managing MSK (musculoskeletal) suggestions for employees, built with React, TypeScript, GraphQL, and Material-UI.

## Running the Application

```bash
# Install dependencies
yarn install

# Run codegen
yarn codegen

# Start the development server
yarn dev
```

The application will be available at `http://localhost:5173`

## Key Features

- Create, edit, and manage MSK suggestions
- Advanced filtering by status, category, priority, and employee
- Bulk status updates for multiple suggestions
- Customisable column visibility with responsive layout
- Global search to quickly find suggestions across multiple fields

## Tech Stack

- React 18 + TypeScript
- Material-UI (MUI) v5 with DataGrid Pro
- Apollo Client + GraphQL
- Zustand (state management)
- React Hook Form (form validation)

## Important Assumptions

### In-Memory Data Store

This application uses an in-memory database loaded from `sample-data.json`. **Data resets on page refresh**. For production use, you'd want to replace this with a proper backend API.

### Frontend GraphQL Resolvers
I've implemented GraphQL resolvers in the frontend (src/apollo/resolvers.ts) to handle queries and mutations against the in-memory data store. Normally, resolvers would live on the backend, but for this demo I wanted to simulate a full GraphQL API without requiring a separate server.

### No Authentication / Permissions

The application doesn't implement authentication/permissions. All actions are attributed to a default "Admin" user.

### MUI DataGrid Pro Licence

This project uses `@mui/x-data-grid-pro` which requires a commercial licence for production use. You'll see a "Missing Licence" watermark in the background of the data grid during development. For evaluation purposes, the watermark doesn't affect functionality and you can use it as-is for testing.

## Architectural Decisions

Throughout development, my main focus was on scalability and reusability - making sure the codebase would be easy to extend and maintain as requirements grow.

### Custom Hooks

I extracted reusable logic into custom hooks like `useOpen` for modal state management and `useResponsive` for breakpoint detection. This keeps components clean, makes the logic easier to test in isolation, and means I can reuse the same behaviour across different parts of the application without duplicating code.

### Component Architecture

I organised components by feature and made sure each one encapsulates its own state. Keeping components small and focused makes them much easier to test and maintain.

### State Management Strategy

**Zustand for UI State**

I went with Zustand for UI state (filters, column visibility, notifications) because it has way less boilerplate than Redux and performs better than Context API, which tends to cause unnecessary re-renders. 

In a larger application, I may mix both Zustand and Context depending on needs - Zustand for frequently changing state that needs good performance, and Context for stable configuration like themes, permissions, or feature flags.

**Apollo Client for Data**

I picked Apollo Client because of its normalised caching system that automatically updates all queries when a single entity changes. This is more sophisticated than React Query's key-based caching and it has first-class support for optimistic updates, which really helps with making the UI feel snappy.

**React Hook Form for Forms**

React Hook Form leverages React's ref system with uncontrolled components, which means way fewer re-renders compared to Formik and Final Form that both use controlled components and re-render on every keystroke.

### Data Layer

**Type-Safe GraphQL**

I'm using code generation with `@graphql-codegen` to automatically generate TypeScript types from the GraphQL schema. This means type safety throughout the entire application and no need to manually maintain types. When the schema changes, the types update automatically.

**Optimistic Updates**

All mutations include optimistic responses so the UI updates instantly before the server confirms the change. This makes the app feel much more responsive, and Apollo Client automatically rolls back if something goes wrong.

**Cache Management**

I'm using a mix of manual cache updates and refetchQueries to keep the UI synchronised after mutations.

### Responsive Design

**Adaptive Columns**

The data grid dynamically shows or hides columns based on screen size using a custom `useResponsive` hook. Essential columns are always visible whilst secondary information only appears on larger screens.

**Progressive Enhancement**

On smaller screens, the filter bar shows fewer filter options and the search with "add suggestion" button stack vertically on two rows. The column visibility menu stays accessible on all screen sizes though.

### Performance Optimisations

**Virtualisation**

MUI DataGrid Pro includes built-in row virtualisation, which means it only renders the rows currently visible in the viewport plus a small buffer. This is crucial for performance when dealing with large datasets - even with thousands of suggestions, only around 20-30 DOM elements are actually rendered at once.

**Debouncing**

I implemented debouncing for the global search to prevent unnecessary API calls whilst users are still typing. 

**Lazy Loading**

Heavy components like modals are lazy-loaded with `React.lazy()` to reduce the initial bundle size. Modals only get loaded when users actually open them.

**Memoisation**

I'm using `useMemo` for expensive computations like filtering columns and `useCallback` for event handlers to prevent unnecessary re-renders. This is particularly important for the data grid which can render hundreds of rows.

**Optimistic UI**

Changes appear immediately before server confirmation, which makes the application feel way more responsive. This works well for simple updates like status changes, though for more complex operations I may use loading spinners instead to set proper expectations.

### User Experience

**Inline Validation**

Forms use real-time validation with immediate error feedback, and the pristine state detection disables the submit button when nothing's changed.

**Bulk Operations**

Users can select multiple suggestions and update their status in one go, with clear feedback and confirmation dialogues.

## Future Enhancements

If I were to continue developing this application, I'd consider:

- **Backend Integration**: Replace in-memory store with REST/GraphQL API
- **Authentication**: Add user login and role-based permissions
- **Status-Based Edit Restrictions**: Disable editing for `IN_PROGRESS` and `COMPLETED` suggestions to prevent accidental changes and data conflicts
- **Status Workflow Enforcement**: Implement proper status transitions (e.g., PENDING → IN_PROGRESS → COMPLETED) with validation
- **Enhanced Validation**: Integrate Yup schema validation with React Hook Form for more complex validation rules and better error messages
- **Design System Separation**: Extract UI components into a separate design layer and use Storybook for component development and testing. This would make it easier to maintain consistent designs, test components in isolation, and create a living documentation for the design system
