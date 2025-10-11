import raw from '../data/sample-data.json'
import { 
  SuggestionStatus, 
  Category, 
  Source, 
  Priority, 
  RiskLevel,
  type Resolvers,
  type UpdateSuggestionInput,
} from '../gql/generated'

const toUpperCase = (value?: string) => (value ?? '').toUpperCase()

const mapCategory = (type: string): Category => {
  const normalizedType = toUpperCase(type)
  if (normalizedType === 'BEHAVIOURAL' || normalizedType === 'BEHAVIORAL') return Category.Behavioural
  if (normalizedType === 'EQUIPMENT') return Category.Equipment
  if (normalizedType === 'EXERCISE') return Category.Exercise
  return Category.Lifestyle
}

const db = {
  employees: raw.employees.map(employee => ({
    ...employee,
    riskLevel: toUpperCase(employee.riskLevel) as RiskLevel,
  })),
  suggestions: raw.suggestions.map(suggestion => {
    const employee = raw.employees.find(emp => emp.id === suggestion.employeeId)
    return {
      id: suggestion.id,
      employeeId: suggestion.employeeId,
      employeeName: employee?.name ?? 'Unknown',
      source: toUpperCase(suggestion.source) as Source,
      category: mapCategory(suggestion.type),
      description: suggestion.description,
      status: toUpperCase(suggestion.status) as SuggestionStatus,
      priority: toUpperCase(suggestion.priority) as Priority,
      dateCreated: suggestion.dateCreated,
      dateUpdated: suggestion.dateUpdated,
      dateCompleted: suggestion.dateCompleted ?? null,
      notes: suggestion.notes ?? '',
      createdBy: suggestion.createdBy ?? null,
    }
  }),
}

export const resolvers: Resolvers = {
  Query: {
    employees: () => db.employees,
    suggestions: (_parent, args) => {
      const searchQuery = (args.q ?? '').toLowerCase()
      
      return db.suggestions.filter(suggestion => {
        // Filter by status
        if (args.status && suggestion.status !== args.status) return false
        
        // Filter by category
        if (args.category && suggestion.category !== args.category) return false
        
        // Filter by priority
        if (args.priority && suggestion.priority !== args.priority) return false

        // Filter by employee ID
        if (args.employeeId && suggestion.employeeId !== args.employeeId) return false
        
        // Filter by employee risk level
        if (args.riskLevel) {
          const employee = db.employees.find(emp => emp.id === suggestion.employeeId)
          if (employee?.riskLevel !== args.riskLevel) return false
        }
        
        // Search across multiple fields
        if (searchQuery) {
          const searchableFields = [
            suggestion.description,
            suggestion.employeeName,
            suggestion.priority,
            suggestion.status,
            suggestion.category,
            suggestion.source,
          ]
          const matchesSearch = searchableFields.some(field => 
            String(field).toLowerCase().includes(searchQuery)
          )
          if (!matchesSearch) return false
        }
        
        return true
      })
    },
  },
  
  Mutation: {
    createSuggestion: (_parent, { input }) => {
      const employee = db.employees.find(emp => emp.id === input.employeeId)
      if (!employee) throw new Error('Employee not found')
      
      const now = new Date().toISOString()
      const newSuggestion = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        employeeName: employee.name,
        source: Source.Admin,
        category: input.category,
        description: input.description,
        status: SuggestionStatus.Pending,
        priority: input.priority ?? Priority.Medium,
        dateCreated: now,
        dateUpdated: now,
        dateCompleted: null,
        notes: '',
        createdBy: null,
      }
      
      db.suggestions.unshift(newSuggestion)
      return newSuggestion
    },
    
    updateSuggestionStatus: (_parent, { id, status }) => {
      const suggestion = db.suggestions.find(sug => sug.id === id)
      if (!suggestion) throw new Error('Suggestion not found')
      
      suggestion.status = status
      suggestion.dateUpdated = new Date().toISOString()
      
      if (status === SuggestionStatus.Completed) {
        suggestion.dateCompleted = suggestion.dateUpdated
      }
      
      return suggestion
    },
    
    updateSuggestion: async (
      _parent,
      { input }: { input: UpdateSuggestionInput },
      context
    ) => {
      const { id, ...updates } = input;
      
      // Validate that suggestion exists
      const suggestion = await context.db.suggestion.findUnique({
        where: { id },
        include: { employee: true },
      });
      
      if (!suggestion) {
        throw new Error('Suggestion not found');
      }
      
      // Update the suggestion
      const updatedSuggestion = await context.db.suggestion.update({
        where: { id },
        data: {
          ...updates,
          dateUpdated: new Date(),
        },
        include: { employee: true },
      });
      
      return {
        ...updatedSuggestion,
        employeeName: updatedSuggestion.employee.name,
      };
    },

    batchUpdateSuggestionStatus: (_parent, { items }) => {
      const idToStatusMap = new Map(items.map(item => [item.id, item.status]))
      const now = new Date().toISOString()
      
      db.suggestions.forEach(suggestion => {
        const newStatus = idToStatusMap.get(suggestion.id)
        if (newStatus) {
          suggestion.status = newStatus
          suggestion.dateUpdated = now
          
          if (newStatus === SuggestionStatus.Completed) {
            suggestion.dateCompleted = now
          }
        }
      })
      
      return db.suggestions.filter(suggestion => idToStatusMap.has(suggestion.id))
    },
  },
}