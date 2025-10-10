import type { GraphQLResolveInfo } from 'graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type BatchStatusInput = {
  id: Scalars['ID']['input'];
  status: SuggestionStatus;
};

export const Category = {
  Behavioural: 'BEHAVIOURAL',
  Equipment: 'EQUIPMENT',
  Exercise: 'EXERCISE',
  Lifestyle: 'LIFESTYLE'
} as const;

export type Category = typeof Category[keyof typeof Category];
export type Employee = {
  __typename?: 'Employee';
  department?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  riskLevel?: Maybe<RiskLevel>;
};

export type Mutation = {
  __typename?: 'Mutation';
  batchUpdateSuggestionStatus: Array<Suggestion>;
  createSuggestion: Suggestion;
  updateSuggestionStatus: Suggestion;
};


export type MutationBatchUpdateSuggestionStatusArgs = {
  items: Array<BatchStatusInput>;
};


export type MutationCreateSuggestionArgs = {
  input: NewSuggestionInput;
};


export type MutationUpdateSuggestionStatusArgs = {
  id: Scalars['ID']['input'];
  status: SuggestionStatus;
};

export type NewSuggestionInput = {
  category: Category;
  description: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  priority?: Priority;
};

export const Priority = {
  High: 'HIGH',
  Low: 'LOW',
  Medium: 'MEDIUM'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];
export type Query = {
  __typename?: 'Query';
  employees: Array<Employee>;
  suggestions: Array<Suggestion>;
};


export type QuerySuggestionsArgs = {
  category?: InputMaybe<Category>;
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<Priority>;
  q?: InputMaybe<Scalars['String']['input']>;
  riskLevel?: InputMaybe<RiskLevel>;
  status?: InputMaybe<SuggestionStatus>;
};

export const RiskLevel = {
  High: 'HIGH',
  Low: 'LOW',
  Medium: 'MEDIUM'
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];
export const Source = {
  Admin: 'ADMIN',
  Vida: 'VIDA'
} as const;

export type Source = typeof Source[keyof typeof Source];
export type Suggestion = {
  __typename?: 'Suggestion';
  category: Category;
  createdBy?: Maybe<Scalars['String']['output']>;
  dateCompleted?: Maybe<Scalars['String']['output']>;
  dateCreated: Scalars['String']['output'];
  dateUpdated: Scalars['String']['output'];
  description: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employeeName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  priority: Priority;
  source: Source;
  status: SuggestionStatus;
};

export const SuggestionStatus = {
  Completed: 'COMPLETED',
  Dismissed: 'DISMISSED',
  InProgress: 'IN_PROGRESS',
  Overdue: 'OVERDUE',
  Pending: 'PENDING'
} as const;

export type SuggestionStatus = typeof SuggestionStatus[keyof typeof SuggestionStatus];
export type EmployeesQueryVariables = Exact<{ [key: string]: never; }>;


export type EmployeesQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, name: string, department?: string | null, riskLevel?: RiskLevel | null }> };

export type SuggestionsQueryVariables = Exact<{
  q?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SuggestionStatus>;
  category?: InputMaybe<Category>;
  priority?: InputMaybe<Priority>;
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  riskLevel?: InputMaybe<RiskLevel>;
}>;


export type SuggestionsQuery = { __typename?: 'Query', suggestions: Array<{ __typename?: 'Suggestion', id: string, employeeId: string, employeeName: string, source: Source, category: Category, description: string, status: SuggestionStatus, priority: Priority, dateCreated: string, dateUpdated: string, dateCompleted?: string | null, notes?: string | null, createdBy?: string | null }> };

export type CreateSuggestionMutationVariables = Exact<{
  input: NewSuggestionInput;
}>;


export type CreateSuggestionMutation = { __typename?: 'Mutation', createSuggestion: { __typename?: 'Suggestion', id: string, employeeId: string, employeeName: string, source: Source, category: Category, description: string, status: SuggestionStatus, priority: Priority, dateCreated: string, dateUpdated: string, dateCompleted?: string | null, notes?: string | null, createdBy?: string | null } };

export type BatchUpdateSuggestionStatusMutationVariables = Exact<{
  items: Array<BatchStatusInput> | BatchStatusInput;
}>;


export type BatchUpdateSuggestionStatusMutation = { __typename?: 'Mutation', batchUpdateSuggestionStatus: Array<{ __typename?: 'Suggestion', id: string, status: SuggestionStatus, dateUpdated: string, dateCompleted?: string | null }> };



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  BatchStatusInput: BatchStatusInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Category: Category;
  Employee: ResolverTypeWrapper<Employee>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  NewSuggestionInput: NewSuggestionInput;
  Priority: Priority;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RiskLevel: RiskLevel;
  Source: Source;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Suggestion: ResolverTypeWrapper<Suggestion>;
  SuggestionStatus: SuggestionStatus;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BatchStatusInput: BatchStatusInput;
  Boolean: Scalars['Boolean']['output'];
  Employee: Employee;
  ID: Scalars['ID']['output'];
  Mutation: Record<PropertyKey, never>;
  NewSuggestionInput: NewSuggestionInput;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  Suggestion: Suggestion;
};

export type EmployeeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Employee'] = ResolversParentTypes['Employee']> = {
  department?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  riskLevel?: Resolver<Maybe<ResolversTypes['RiskLevel']>, ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  batchUpdateSuggestionStatus?: Resolver<Array<ResolversTypes['Suggestion']>, ParentType, ContextType, RequireFields<MutationBatchUpdateSuggestionStatusArgs, 'items'>>;
  createSuggestion?: Resolver<ResolversTypes['Suggestion'], ParentType, ContextType, RequireFields<MutationCreateSuggestionArgs, 'input'>>;
  updateSuggestionStatus?: Resolver<ResolversTypes['Suggestion'], ParentType, ContextType, RequireFields<MutationUpdateSuggestionStatusArgs, 'id' | 'status'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  employees?: Resolver<Array<ResolversTypes['Employee']>, ParentType, ContextType>;
  suggestions?: Resolver<Array<ResolversTypes['Suggestion']>, ParentType, ContextType, Partial<QuerySuggestionsArgs>>;
};

export type SuggestionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Suggestion'] = ResolversParentTypes['Suggestion']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCompleted?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dateUpdated?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employeeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  employeeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Priority'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['Source'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SuggestionStatus'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Employee?: EmployeeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Suggestion?: SuggestionResolvers<ContextType>;
};



export const EmployeesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Employees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}}]}}]}}]} as unknown as DocumentNode<EmployeesQuery, EmployeesQueryVariables>;
export const SuggestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Suggestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SuggestionStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priority"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Priority"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"riskLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RiskLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"priority"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priority"}}},{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"riskLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"riskLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dateCreated"}},{"kind":"Field","name":{"kind":"Name","value":"dateUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"dateCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}}]}}]} as unknown as DocumentNode<SuggestionsQuery, SuggestionsQueryVariables>;
export const CreateSuggestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSuggestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewSuggestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSuggestion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dateCreated"}},{"kind":"Field","name":{"kind":"Name","value":"dateUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"dateCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}}]}}]}}]} as unknown as DocumentNode<CreateSuggestionMutation, CreateSuggestionMutationVariables>;
export const BatchUpdateSuggestionStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BatchUpdateSuggestionStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BatchStatusInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"batchUpdateSuggestionStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dateUpdated"}},{"kind":"Field","name":{"kind":"Name","value":"dateCompleted"}}]}}]}}]} as unknown as DocumentNode<BatchUpdateSuggestionStatusMutation, BatchUpdateSuggestionStatusMutationVariables>;