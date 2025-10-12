import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Stack,
  Alert,
  Typography,
  FormHelperText,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm, Controller } from "react-hook-form";
import {
  EmployeesDocument,
  SuggestionsDocument,
  CreateSuggestionDocument,
  UpdateSuggestionDocument,
  Category,
  Priority,
  type Employee,
  type SuggestionsQueryVariables,
  type Suggestion,
  Source,
  SuggestionStatus,
} from "../../gql/generated";
import { CATEGORIES, PRIORITIES, STATUSES } from "../../constants/suggestions";
import { useState, useEffect } from "react";
import { toTitleCase } from "../../utils/stringUtils";

interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  filters: SuggestionsQueryVariables;
  suggestion?: Suggestion | null; // If provided, it's edit mode
}

interface FormValues {
  employee: Employee | null;
  category: Category;
  status: SuggestionStatus;
  description: string;
  priority: Priority;
  notes?: string;
}

const SuggestionModal = ({
  open,
  onClose,
  onSuccess,
  filters,
  suggestion,
}: SuggestionModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!suggestion;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      employee: null,
      category: Category.Exercise,
      status: SuggestionStatus.Pending,
      description: "",
      priority: Priority.Medium,
      notes: "",
    },
    mode: "onChange",
  });

  const { data: employeesData, loading: employeesLoading } =
    useQuery(EmployeesDocument);

  // Reset form when suggestion changes (for edit mode)
  useEffect(() => {
    if (suggestion && employeesData?.employees) {
      const employee = employeesData.employees.find(
        (emp) => emp.id === suggestion.employeeId
      );
      reset({
        employee: employee || null,
        category: suggestion.category,
        status: suggestion.status,
        description: suggestion.description,
        priority: suggestion.priority,
        notes: suggestion.notes || "",
      });
    }
  }, [suggestion, employeesData, reset]);

  const [createSuggestion, { loading: creating }] = useMutation(
    CreateSuggestionDocument,
    {
      refetchQueries: [
        {
          query: SuggestionsDocument,
          variables: filters,
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: () => {
        onSuccess?.();
        handleClose();
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const [updateSuggestion, { loading: updating }] = useMutation(
    UpdateSuggestionDocument,
    {
      refetchQueries: [
        {
          query: SuggestionsDocument,
          variables: filters,
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: () => {
        onSuccess?.();
        handleClose();
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const onSubmit = async (data: FormValues) => {
    if (!data.employee) return;

    setError(null);

    try {
      if (isEditMode) {
        await updateSuggestion({
          variables: {
            input: {
              id: suggestion.id,
              employeeId: data.employee.id,
              category: data.category,
              description: data.description.trim(),
              priority: data.priority,
              notes: data.notes?.trim() || "",
              status: data.status,
            },
          },
          optimisticResponse: {
            updateSuggestion: {
              ...suggestion,
              employeeId: data.employee.id,
              employeeName: data.employee.name,
              category: data.category,
              description: data.description.trim(),
              priority: data.priority,
              notes: data.notes?.trim() || "",
              status: data.status,
              dateUpdated: new Date().toISOString(),
            },
          },
        });
      } else {
        await createSuggestion({
          variables: {
            input: {
              employeeId: data.employee.id,
              category: data.category,
              description: data.description.trim(),
              priority: data.priority,
            },
          },
          optimisticResponse: {
            createSuggestion: {
              __typename: "Suggestion",
              id: "temp-" + Date.now(),
              employeeId: data.employee.id,
              employeeName: data.employee.name,
              source: Source.Admin,
              category: data.category,
              description: data.description.trim(),
              status: SuggestionStatus.Pending,
              priority: data.priority,
              dateCreated: new Date().toISOString(),
              dateUpdated: new Date().toISOString(),
              dateCompleted: null,
              notes: data.notes || "",
              createdBy: "Admin",
            },
          },
        });
      }
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} suggestion:`,
        err
      );
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const loading = creating || updating;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {isEditMode ? "Edit Recommendation" : "Add New Recommendation"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode
              ? "Update the health and safety suggestion"
              : "Create a health and safety suggestion for an employee"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Employee Selection */}
            <Controller
              name="employee"
              control={control}
              rules={{ required: "Employee is required" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={employeesData?.employees ?? []}
                  getOptionLabel={(option) =>
                    `${option.name}${option.department ? ` (${option.department})` : ""}`
                  }
                  value={value}
                  onChange={(_, newValue) => onChange(newValue)}
                  loading={employeesLoading}
                  disabled={employeesLoading || isEditMode}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employee"
                      required
                      placeholder="Search employee..."
                      error={!!errors.employee}
                      helperText={errors.employee?.message}
                    />
                  )}
                />
              )}
            />

            {/* Status Selection */}
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              disabled={!isEditMode}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {toTitleCase(status)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Category Selection */}
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {toTitleCase(category)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <FormHelperText>{errors.category.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={4}
                  required
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="Describe the recommendation..."
                />
              )}
            />

            {/* Priority */}
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    {PRIORITIES.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {toTitleCase(priority)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{errors.priority.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Notes (Optional) */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="Additional notes..."
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Recommendation"
                : "Create Recommendation"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SuggestionModal;
