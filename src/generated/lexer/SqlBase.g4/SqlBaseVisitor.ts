// Generated from trino/SqlBase.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { SingleStatementContext } from "./SqlBaseParser.js";
import { StandaloneExpressionContext } from "./SqlBaseParser.js";
import { StandalonePathSpecificationContext } from "./SqlBaseParser.js";
import { StandaloneTypeContext } from "./SqlBaseParser.js";
import { StandaloneRowPatternContext } from "./SqlBaseParser.js";
import { StatementDefaultContext } from "./SqlBaseParser.js";
import { UseContext } from "./SqlBaseParser.js";
import { CreateCatalogContext } from "./SqlBaseParser.js";
import { DropCatalogContext } from "./SqlBaseParser.js";
import { CreateSchemaContext } from "./SqlBaseParser.js";
import { DropSchemaContext } from "./SqlBaseParser.js";
import { RenameSchemaContext } from "./SqlBaseParser.js";
import { SetSchemaAuthorizationContext } from "./SqlBaseParser.js";
import { CreateTableAsSelectContext } from "./SqlBaseParser.js";
import { CreateTableContext } from "./SqlBaseParser.js";
import { DropTableContext } from "./SqlBaseParser.js";
import { InsertIntoContext } from "./SqlBaseParser.js";
import { DeleteContext } from "./SqlBaseParser.js";
import { TruncateTableContext } from "./SqlBaseParser.js";
import { CommentTableContext } from "./SqlBaseParser.js";
import { CommentViewContext } from "./SqlBaseParser.js";
import { CommentColumnContext } from "./SqlBaseParser.js";
import { RenameTableContext } from "./SqlBaseParser.js";
import { AddColumnContext } from "./SqlBaseParser.js";
import { RenameColumnContext } from "./SqlBaseParser.js";
import { DropColumnContext } from "./SqlBaseParser.js";
import { SetColumnTypeContext } from "./SqlBaseParser.js";
import { SetTableAuthorizationContext } from "./SqlBaseParser.js";
import { SetTablePropertiesContext } from "./SqlBaseParser.js";
import { TableExecuteContext } from "./SqlBaseParser.js";
import { AnalyzeContext } from "./SqlBaseParser.js";
import { CreateMaterializedViewContext } from "./SqlBaseParser.js";
import { CreateViewContext } from "./SqlBaseParser.js";
import { RefreshMaterializedViewContext } from "./SqlBaseParser.js";
import { DropMaterializedViewContext } from "./SqlBaseParser.js";
import { RenameMaterializedViewContext } from "./SqlBaseParser.js";
import { SetMaterializedViewPropertiesContext } from "./SqlBaseParser.js";
import { DropViewContext } from "./SqlBaseParser.js";
import { RenameViewContext } from "./SqlBaseParser.js";
import { SetViewAuthorizationContext } from "./SqlBaseParser.js";
import { CallContext } from "./SqlBaseParser.js";
import { CreateRoleContext } from "./SqlBaseParser.js";
import { DropRoleContext } from "./SqlBaseParser.js";
import { GrantRolesContext } from "./SqlBaseParser.js";
import { RevokeRolesContext } from "./SqlBaseParser.js";
import { SetRoleContext } from "./SqlBaseParser.js";
import { GrantContext } from "./SqlBaseParser.js";
import { DenyContext } from "./SqlBaseParser.js";
import { RevokeContext } from "./SqlBaseParser.js";
import { ShowGrantsContext } from "./SqlBaseParser.js";
import { ExplainContext } from "./SqlBaseParser.js";
import { ExplainAnalyzeContext } from "./SqlBaseParser.js";
import { ShowCreateTableContext } from "./SqlBaseParser.js";
import { ShowCreateSchemaContext } from "./SqlBaseParser.js";
import { ShowCreateViewContext } from "./SqlBaseParser.js";
import { ShowCreateMaterializedViewContext } from "./SqlBaseParser.js";
import { ShowTablesContext } from "./SqlBaseParser.js";
import { ShowSchemasContext } from "./SqlBaseParser.js";
import { ShowCatalogsContext } from "./SqlBaseParser.js";
import { ShowColumnsContext } from "./SqlBaseParser.js";
import { ShowStatsContext } from "./SqlBaseParser.js";
import { ShowStatsForQueryContext } from "./SqlBaseParser.js";
import { ShowRolesContext } from "./SqlBaseParser.js";
import { ShowRoleGrantsContext } from "./SqlBaseParser.js";
import { ShowFunctionsContext } from "./SqlBaseParser.js";
import { ShowSessionContext } from "./SqlBaseParser.js";
import { SetSessionAuthorizationContext } from "./SqlBaseParser.js";
import { ResetSessionAuthorizationContext } from "./SqlBaseParser.js";
import { SetSessionContext } from "./SqlBaseParser.js";
import { ResetSessionContext } from "./SqlBaseParser.js";
import { StartTransactionContext } from "./SqlBaseParser.js";
import { CommitContext } from "./SqlBaseParser.js";
import { RollbackContext } from "./SqlBaseParser.js";
import { PrepareContext } from "./SqlBaseParser.js";
import { DeallocateContext } from "./SqlBaseParser.js";
import { ExecuteContext } from "./SqlBaseParser.js";
import { ExecuteImmediateContext } from "./SqlBaseParser.js";
import { DescribeInputContext } from "./SqlBaseParser.js";
import { DescribeOutputContext } from "./SqlBaseParser.js";
import { SetPathContext } from "./SqlBaseParser.js";
import { SetTimeZoneContext } from "./SqlBaseParser.js";
import { UpdateContext } from "./SqlBaseParser.js";
import { MergeContext } from "./SqlBaseParser.js";
import { QueryContext } from "./SqlBaseParser.js";
import { WithContext } from "./SqlBaseParser.js";
import { TableElementContext } from "./SqlBaseParser.js";
import { ColumnDefinitionContext } from "./SqlBaseParser.js";
import { LikeClauseContext } from "./SqlBaseParser.js";
import { PropertiesContext } from "./SqlBaseParser.js";
import { PropertyAssignmentsContext } from "./SqlBaseParser.js";
import { PropertyContext } from "./SqlBaseParser.js";
import { DefaultPropertyValueContext } from "./SqlBaseParser.js";
import { NonDefaultPropertyValueContext } from "./SqlBaseParser.js";
import { QueryNoWithContext } from "./SqlBaseParser.js";
import { LimitRowCountContext } from "./SqlBaseParser.js";
import { RowCountContext } from "./SqlBaseParser.js";
import { QueryTermDefaultContext } from "./SqlBaseParser.js";
import { SetOperationContext } from "./SqlBaseParser.js";
import { QueryPrimaryDefaultContext } from "./SqlBaseParser.js";
import { TableContext } from "./SqlBaseParser.js";
import { InlineTableContext } from "./SqlBaseParser.js";
import { SubqueryContext } from "./SqlBaseParser.js";
import { SortItemContext } from "./SqlBaseParser.js";
import { QuerySpecificationContext } from "./SqlBaseParser.js";
import { GroupByContext } from "./SqlBaseParser.js";
import { SingleGroupingSetContext } from "./SqlBaseParser.js";
import { RollupContext } from "./SqlBaseParser.js";
import { CubeContext } from "./SqlBaseParser.js";
import { MultipleGroupingSetsContext } from "./SqlBaseParser.js";
import { GroupingSetContext } from "./SqlBaseParser.js";
import { WindowDefinitionContext } from "./SqlBaseParser.js";
import { WindowSpecificationContext } from "./SqlBaseParser.js";
import { NamedQueryContext } from "./SqlBaseParser.js";
import { SetQuantifierContext } from "./SqlBaseParser.js";
import { SelectSingleContext } from "./SqlBaseParser.js";
import { SelectAllContext } from "./SqlBaseParser.js";
import { RelationDefaultContext } from "./SqlBaseParser.js";
import { JoinRelationContext } from "./SqlBaseParser.js";
import { JoinTypeContext } from "./SqlBaseParser.js";
import { JoinCriteriaContext } from "./SqlBaseParser.js";
import { SampledRelationContext } from "./SqlBaseParser.js";
import { SampleTypeContext } from "./SqlBaseParser.js";
import { TrimsSpecificationContext } from "./SqlBaseParser.js";
import { ListAggOverflowBehaviorContext } from "./SqlBaseParser.js";
import { ListaggCountIndicationContext } from "./SqlBaseParser.js";
import { PatternRecognitionContext } from "./SqlBaseParser.js";
import { MeasureDefinitionContext } from "./SqlBaseParser.js";
import { RowsPerMatchContext } from "./SqlBaseParser.js";
import { EmptyMatchHandlingContext } from "./SqlBaseParser.js";
import { SkipToContext } from "./SqlBaseParser.js";
import { SubsetDefinitionContext } from "./SqlBaseParser.js";
import { VariableDefinitionContext } from "./SqlBaseParser.js";
import { AliasedRelationContext } from "./SqlBaseParser.js";
import { ColumnAliasesContext } from "./SqlBaseParser.js";
import { TableNameContext } from "./SqlBaseParser.js";
import { SubqueryRelationContext } from "./SqlBaseParser.js";
import { UnnestContext } from "./SqlBaseParser.js";
import { LateralContext } from "./SqlBaseParser.js";
import { TableFunctionInvocationContext } from "./SqlBaseParser.js";
import { ParenthesizedRelationContext } from "./SqlBaseParser.js";
import { JsonTableContext } from "./SqlBaseParser.js";
import { OrdinalityColumnContext } from "./SqlBaseParser.js";
import { ValueColumnContext } from "./SqlBaseParser.js";
import { QueryColumnContext } from "./SqlBaseParser.js";
import { NestedColumnsContext } from "./SqlBaseParser.js";
import { LeafPlanContext } from "./SqlBaseParser.js";
import { JoinPlanContext } from "./SqlBaseParser.js";
import { UnionPlanContext } from "./SqlBaseParser.js";
import { CrossPlanContext } from "./SqlBaseParser.js";
import { JsonTablePathNameContext } from "./SqlBaseParser.js";
import { PlanPrimaryContext } from "./SqlBaseParser.js";
import { JsonTableDefaultPlanContext } from "./SqlBaseParser.js";
import { TableFunctionCallContext } from "./SqlBaseParser.js";
import { TableFunctionArgumentContext } from "./SqlBaseParser.js";
import { TableArgumentContext } from "./SqlBaseParser.js";
import { TableArgumentTableContext } from "./SqlBaseParser.js";
import { TableArgumentQueryContext } from "./SqlBaseParser.js";
import { DescriptorArgumentContext } from "./SqlBaseParser.js";
import { DescriptorFieldContext } from "./SqlBaseParser.js";
import { CopartitionTablesContext } from "./SqlBaseParser.js";
import { ExpressionContext } from "./SqlBaseParser.js";
import { LogicalNotContext } from "./SqlBaseParser.js";
import { PredicatedContext } from "./SqlBaseParser.js";
import { OrContext } from "./SqlBaseParser.js";
import { AndContext } from "./SqlBaseParser.js";
import { ComparisonContext } from "./SqlBaseParser.js";
import { QuantifiedComparisonContext } from "./SqlBaseParser.js";
import { BetweenContext } from "./SqlBaseParser.js";
import { InListContext } from "./SqlBaseParser.js";
import { InSubqueryContext } from "./SqlBaseParser.js";
import { LikeContext } from "./SqlBaseParser.js";
import { NullPredicateContext } from "./SqlBaseParser.js";
import { DistinctFromContext } from "./SqlBaseParser.js";
import { ValueExpressionDefaultContext } from "./SqlBaseParser.js";
import { ConcatenationContext } from "./SqlBaseParser.js";
import { ArithmeticBinaryContext } from "./SqlBaseParser.js";
import { ArithmeticUnaryContext } from "./SqlBaseParser.js";
import { AtTimeZoneContext } from "./SqlBaseParser.js";
import { DereferenceContext } from "./SqlBaseParser.js";
import { TypeConstructorContext } from "./SqlBaseParser.js";
import { JsonValueContext } from "./SqlBaseParser.js";
import { SpecialDateTimeFunctionContext } from "./SqlBaseParser.js";
import { SubstringContext } from "./SqlBaseParser.js";
import { CastContext } from "./SqlBaseParser.js";
import { LambdaContext } from "./SqlBaseParser.js";
import { ParenthesizedExpressionContext } from "./SqlBaseParser.js";
import { TrimContext } from "./SqlBaseParser.js";
import { ParameterContext } from "./SqlBaseParser.js";
import { NormalizeContext } from "./SqlBaseParser.js";
import { JsonObjectContext } from "./SqlBaseParser.js";
import { IntervalLiteralContext } from "./SqlBaseParser.js";
import { NumericLiteralContext } from "./SqlBaseParser.js";
import { BooleanLiteralContext } from "./SqlBaseParser.js";
import { JsonArrayContext } from "./SqlBaseParser.js";
import { SimpleCaseContext } from "./SqlBaseParser.js";
import { ColumnReferenceContext } from "./SqlBaseParser.js";
import { NullLiteralContext } from "./SqlBaseParser.js";
import { RowConstructorContext } from "./SqlBaseParser.js";
import { SubscriptContext } from "./SqlBaseParser.js";
import { JsonExistsContext } from "./SqlBaseParser.js";
import { CurrentPathContext } from "./SqlBaseParser.js";
import { SubqueryExpressionContext } from "./SqlBaseParser.js";
import { BinaryLiteralContext } from "./SqlBaseParser.js";
import { CurrentUserContext } from "./SqlBaseParser.js";
import { JsonQueryContext } from "./SqlBaseParser.js";
import { MeasureContext } from "./SqlBaseParser.js";
import { ExtractContext } from "./SqlBaseParser.js";
import { StringLiteralContext } from "./SqlBaseParser.js";
import { ArrayConstructorContext } from "./SqlBaseParser.js";
import { FunctionCallContext } from "./SqlBaseParser.js";
import { CurrentSchemaContext } from "./SqlBaseParser.js";
import { ExistsContext } from "./SqlBaseParser.js";
import { PositionContext } from "./SqlBaseParser.js";
import { ListaggContext } from "./SqlBaseParser.js";
import { SearchedCaseContext } from "./SqlBaseParser.js";
import { CurrentCatalogContext } from "./SqlBaseParser.js";
import { GroupingOperationContext } from "./SqlBaseParser.js";
import { JsonPathInvocationContext } from "./SqlBaseParser.js";
import { JsonValueExpressionContext } from "./SqlBaseParser.js";
import { JsonRepresentationContext } from "./SqlBaseParser.js";
import { JsonArgumentContext } from "./SqlBaseParser.js";
import { JsonExistsErrorBehaviorContext } from "./SqlBaseParser.js";
import { JsonValueBehaviorContext } from "./SqlBaseParser.js";
import { JsonQueryWrapperBehaviorContext } from "./SqlBaseParser.js";
import { JsonQueryBehaviorContext } from "./SqlBaseParser.js";
import { JsonObjectMemberContext } from "./SqlBaseParser.js";
import { ProcessingModeContext } from "./SqlBaseParser.js";
import { NullTreatmentContext } from "./SqlBaseParser.js";
import { BasicStringLiteralContext } from "./SqlBaseParser.js";
import { UnicodeStringLiteralContext } from "./SqlBaseParser.js";
import { TimeZoneIntervalContext } from "./SqlBaseParser.js";
import { TimeZoneStringContext } from "./SqlBaseParser.js";
import { ComparisonOperatorContext } from "./SqlBaseParser.js";
import { ComparisonQuantifierContext } from "./SqlBaseParser.js";
import { BooleanValueContext } from "./SqlBaseParser.js";
import { IntervalContext } from "./SqlBaseParser.js";
import { IntervalFieldContext } from "./SqlBaseParser.js";
import { NormalFormContext } from "./SqlBaseParser.js";
import { RowTypeContext } from "./SqlBaseParser.js";
import { IntervalTypeContext } from "./SqlBaseParser.js";
import { ArrayTypeContext } from "./SqlBaseParser.js";
import { DoublePrecisionTypeContext } from "./SqlBaseParser.js";
import { LegacyArrayTypeContext } from "./SqlBaseParser.js";
import { GenericTypeContext } from "./SqlBaseParser.js";
import { DateTimeTypeContext } from "./SqlBaseParser.js";
import { LegacyMapTypeContext } from "./SqlBaseParser.js";
import { RowFieldContext } from "./SqlBaseParser.js";
import { TypeParameterContext } from "./SqlBaseParser.js";
import { WhenClauseContext } from "./SqlBaseParser.js";
import { FilterContext } from "./SqlBaseParser.js";
import { MergeUpdateContext } from "./SqlBaseParser.js";
import { MergeDeleteContext } from "./SqlBaseParser.js";
import { MergeInsertContext } from "./SqlBaseParser.js";
import { OverContext } from "./SqlBaseParser.js";
import { WindowFrameContext } from "./SqlBaseParser.js";
import { FrameExtentContext } from "./SqlBaseParser.js";
import { UnboundedFrameContext } from "./SqlBaseParser.js";
import { CurrentRowBoundContext } from "./SqlBaseParser.js";
import { BoundedFrameContext } from "./SqlBaseParser.js";
import { QuantifiedPrimaryContext } from "./SqlBaseParser.js";
import { PatternConcatenationContext } from "./SqlBaseParser.js";
import { PatternAlternationContext } from "./SqlBaseParser.js";
import { PatternVariableContext } from "./SqlBaseParser.js";
import { EmptyPatternContext } from "./SqlBaseParser.js";
import { PatternPermutationContext } from "./SqlBaseParser.js";
import { GroupedPatternContext } from "./SqlBaseParser.js";
import { PartitionStartAnchorContext } from "./SqlBaseParser.js";
import { PartitionEndAnchorContext } from "./SqlBaseParser.js";
import { ExcludedPatternContext } from "./SqlBaseParser.js";
import { ZeroOrMoreQuantifierContext } from "./SqlBaseParser.js";
import { OneOrMoreQuantifierContext } from "./SqlBaseParser.js";
import { ZeroOrOneQuantifierContext } from "./SqlBaseParser.js";
import { RangeQuantifierContext } from "./SqlBaseParser.js";
import { UpdateAssignmentContext } from "./SqlBaseParser.js";
import { ExplainFormatContext } from "./SqlBaseParser.js";
import { ExplainTypeContext } from "./SqlBaseParser.js";
import { IsolationLevelContext } from "./SqlBaseParser.js";
import { TransactionAccessModeContext } from "./SqlBaseParser.js";
import { ReadUncommittedContext } from "./SqlBaseParser.js";
import { ReadCommittedContext } from "./SqlBaseParser.js";
import { RepeatableReadContext } from "./SqlBaseParser.js";
import { SerializableContext } from "./SqlBaseParser.js";
import { PositionalArgumentContext } from "./SqlBaseParser.js";
import { NamedArgumentContext } from "./SqlBaseParser.js";
import { QualifiedArgumentContext } from "./SqlBaseParser.js";
import { UnqualifiedArgumentContext } from "./SqlBaseParser.js";
import { PathSpecificationContext } from "./SqlBaseParser.js";
import { PrivilegeContext } from "./SqlBaseParser.js";
import { QualifiedNameContext } from "./SqlBaseParser.js";
import { QueryPeriodContext } from "./SqlBaseParser.js";
import { RangeTypeContext } from "./SqlBaseParser.js";
import { SpecifiedPrincipalContext } from "./SqlBaseParser.js";
import { CurrentUserGrantorContext } from "./SqlBaseParser.js";
import { CurrentRoleGrantorContext } from "./SqlBaseParser.js";
import { UnspecifiedPrincipalContext } from "./SqlBaseParser.js";
import { UserPrincipalContext } from "./SqlBaseParser.js";
import { RolePrincipalContext } from "./SqlBaseParser.js";
import { RolesContext } from "./SqlBaseParser.js";
import { UnquotedIdentifierContext } from "./SqlBaseParser.js";
import { QuotedIdentifierContext } from "./SqlBaseParser.js";
import { BackQuotedIdentifierContext } from "./SqlBaseParser.js";
import { DigitIdentifierContext } from "./SqlBaseParser.js";
import { DecimalLiteralContext } from "./SqlBaseParser.js";
import { DoubleLiteralContext } from "./SqlBaseParser.js";
import { IntegerLiteralContext } from "./SqlBaseParser.js";
import { IdentifierUserContext } from "./SqlBaseParser.js";
import { StringUserContext } from "./SqlBaseParser.js";
import { NonReservedContext } from "./SqlBaseParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `SqlBaseParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class SqlBaseVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `SqlBaseParser.singleStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSingleStatement?: (ctx: SingleStatementContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.standaloneExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStandaloneExpression?: (ctx: StandaloneExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.standalonePathSpecification`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStandalonePathSpecification?: (ctx: StandalonePathSpecificationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.standaloneType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStandaloneType?: (ctx: StandaloneTypeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.standaloneRowPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStandaloneRowPattern?: (ctx: StandaloneRowPatternContext) => Result;
    /**
     * Visit a parse tree produced by the `statementDefault`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatementDefault?: (ctx: StatementDefaultContext) => Result;
    /**
     * Visit a parse tree produced by the `use`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUse?: (ctx: UseContext) => Result;
    /**
     * Visit a parse tree produced by the `createCatalog`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateCatalog?: (ctx: CreateCatalogContext) => Result;
    /**
     * Visit a parse tree produced by the `dropCatalog`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropCatalog?: (ctx: DropCatalogContext) => Result;
    /**
     * Visit a parse tree produced by the `createSchema`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateSchema?: (ctx: CreateSchemaContext) => Result;
    /**
     * Visit a parse tree produced by the `dropSchema`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropSchema?: (ctx: DropSchemaContext) => Result;
    /**
     * Visit a parse tree produced by the `renameSchema`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenameSchema?: (ctx: RenameSchemaContext) => Result;
    /**
     * Visit a parse tree produced by the `setSchemaAuthorization`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetSchemaAuthorization?: (ctx: SetSchemaAuthorizationContext) => Result;
    /**
     * Visit a parse tree produced by the `createTableAsSelect`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateTableAsSelect?: (ctx: CreateTableAsSelectContext) => Result;
    /**
     * Visit a parse tree produced by the `createTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateTable?: (ctx: CreateTableContext) => Result;
    /**
     * Visit a parse tree produced by the `dropTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropTable?: (ctx: DropTableContext) => Result;
    /**
     * Visit a parse tree produced by the `insertInto`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInsertInto?: (ctx: InsertIntoContext) => Result;
    /**
     * Visit a parse tree produced by the `delete`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDelete?: (ctx: DeleteContext) => Result;
    /**
     * Visit a parse tree produced by the `truncateTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTruncateTable?: (ctx: TruncateTableContext) => Result;
    /**
     * Visit a parse tree produced by the `commentTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCommentTable?: (ctx: CommentTableContext) => Result;
    /**
     * Visit a parse tree produced by the `commentView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCommentView?: (ctx: CommentViewContext) => Result;
    /**
     * Visit a parse tree produced by the `commentColumn`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCommentColumn?: (ctx: CommentColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `renameTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenameTable?: (ctx: RenameTableContext) => Result;
    /**
     * Visit a parse tree produced by the `addColumn`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAddColumn?: (ctx: AddColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `renameColumn`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenameColumn?: (ctx: RenameColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `dropColumn`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropColumn?: (ctx: DropColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `setColumnType`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetColumnType?: (ctx: SetColumnTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `setTableAuthorization`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetTableAuthorization?: (ctx: SetTableAuthorizationContext) => Result;
    /**
     * Visit a parse tree produced by the `setTableProperties`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetTableProperties?: (ctx: SetTablePropertiesContext) => Result;
    /**
     * Visit a parse tree produced by the `tableExecute`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableExecute?: (ctx: TableExecuteContext) => Result;
    /**
     * Visit a parse tree produced by the `analyze`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnalyze?: (ctx: AnalyzeContext) => Result;
    /**
     * Visit a parse tree produced by the `createMaterializedView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateMaterializedView?: (ctx: CreateMaterializedViewContext) => Result;
    /**
     * Visit a parse tree produced by the `createView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateView?: (ctx: CreateViewContext) => Result;
    /**
     * Visit a parse tree produced by the `refreshMaterializedView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRefreshMaterializedView?: (ctx: RefreshMaterializedViewContext) => Result;
    /**
     * Visit a parse tree produced by the `dropMaterializedView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropMaterializedView?: (ctx: DropMaterializedViewContext) => Result;
    /**
     * Visit a parse tree produced by the `renameMaterializedView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenameMaterializedView?: (ctx: RenameMaterializedViewContext) => Result;
    /**
     * Visit a parse tree produced by the `setMaterializedViewProperties`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetMaterializedViewProperties?: (ctx: SetMaterializedViewPropertiesContext) => Result;
    /**
     * Visit a parse tree produced by the `dropView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropView?: (ctx: DropViewContext) => Result;
    /**
     * Visit a parse tree produced by the `renameView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRenameView?: (ctx: RenameViewContext) => Result;
    /**
     * Visit a parse tree produced by the `setViewAuthorization`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetViewAuthorization?: (ctx: SetViewAuthorizationContext) => Result;
    /**
     * Visit a parse tree produced by the `call`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCall?: (ctx: CallContext) => Result;
    /**
     * Visit a parse tree produced by the `createRole`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreateRole?: (ctx: CreateRoleContext) => Result;
    /**
     * Visit a parse tree produced by the `dropRole`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDropRole?: (ctx: DropRoleContext) => Result;
    /**
     * Visit a parse tree produced by the `grantRoles`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGrantRoles?: (ctx: GrantRolesContext) => Result;
    /**
     * Visit a parse tree produced by the `revokeRoles`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRevokeRoles?: (ctx: RevokeRolesContext) => Result;
    /**
     * Visit a parse tree produced by the `setRole`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetRole?: (ctx: SetRoleContext) => Result;
    /**
     * Visit a parse tree produced by the `grant`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGrant?: (ctx: GrantContext) => Result;
    /**
     * Visit a parse tree produced by the `deny`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeny?: (ctx: DenyContext) => Result;
    /**
     * Visit a parse tree produced by the `revoke`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRevoke?: (ctx: RevokeContext) => Result;
    /**
     * Visit a parse tree produced by the `showGrants`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowGrants?: (ctx: ShowGrantsContext) => Result;
    /**
     * Visit a parse tree produced by the `explain`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExplain?: (ctx: ExplainContext) => Result;
    /**
     * Visit a parse tree produced by the `explainAnalyze`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExplainAnalyze?: (ctx: ExplainAnalyzeContext) => Result;
    /**
     * Visit a parse tree produced by the `showCreateTable`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowCreateTable?: (ctx: ShowCreateTableContext) => Result;
    /**
     * Visit a parse tree produced by the `showCreateSchema`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowCreateSchema?: (ctx: ShowCreateSchemaContext) => Result;
    /**
     * Visit a parse tree produced by the `showCreateView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowCreateView?: (ctx: ShowCreateViewContext) => Result;
    /**
     * Visit a parse tree produced by the `showCreateMaterializedView`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowCreateMaterializedView?: (ctx: ShowCreateMaterializedViewContext) => Result;
    /**
     * Visit a parse tree produced by the `showTables`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowTables?: (ctx: ShowTablesContext) => Result;
    /**
     * Visit a parse tree produced by the `showSchemas`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowSchemas?: (ctx: ShowSchemasContext) => Result;
    /**
     * Visit a parse tree produced by the `showCatalogs`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowCatalogs?: (ctx: ShowCatalogsContext) => Result;
    /**
     * Visit a parse tree produced by the `showColumns`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowColumns?: (ctx: ShowColumnsContext) => Result;
    /**
     * Visit a parse tree produced by the `showStats`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowStats?: (ctx: ShowStatsContext) => Result;
    /**
     * Visit a parse tree produced by the `showStatsForQuery`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowStatsForQuery?: (ctx: ShowStatsForQueryContext) => Result;
    /**
     * Visit a parse tree produced by the `showRoles`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowRoles?: (ctx: ShowRolesContext) => Result;
    /**
     * Visit a parse tree produced by the `showRoleGrants`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowRoleGrants?: (ctx: ShowRoleGrantsContext) => Result;
    /**
     * Visit a parse tree produced by the `showFunctions`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowFunctions?: (ctx: ShowFunctionsContext) => Result;
    /**
     * Visit a parse tree produced by the `showSession`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitShowSession?: (ctx: ShowSessionContext) => Result;
    /**
     * Visit a parse tree produced by the `setSessionAuthorization`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetSessionAuthorization?: (ctx: SetSessionAuthorizationContext) => Result;
    /**
     * Visit a parse tree produced by the `resetSessionAuthorization`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitResetSessionAuthorization?: (ctx: ResetSessionAuthorizationContext) => Result;
    /**
     * Visit a parse tree produced by the `setSession`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetSession?: (ctx: SetSessionContext) => Result;
    /**
     * Visit a parse tree produced by the `resetSession`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitResetSession?: (ctx: ResetSessionContext) => Result;
    /**
     * Visit a parse tree produced by the `startTransaction`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStartTransaction?: (ctx: StartTransactionContext) => Result;
    /**
     * Visit a parse tree produced by the `commit`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCommit?: (ctx: CommitContext) => Result;
    /**
     * Visit a parse tree produced by the `rollback`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRollback?: (ctx: RollbackContext) => Result;
    /**
     * Visit a parse tree produced by the `prepare`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrepare?: (ctx: PrepareContext) => Result;
    /**
     * Visit a parse tree produced by the `deallocate`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeallocate?: (ctx: DeallocateContext) => Result;
    /**
     * Visit a parse tree produced by the `execute`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExecute?: (ctx: ExecuteContext) => Result;
    /**
     * Visit a parse tree produced by the `executeImmediate`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExecuteImmediate?: (ctx: ExecuteImmediateContext) => Result;
    /**
     * Visit a parse tree produced by the `describeInput`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDescribeInput?: (ctx: DescribeInputContext) => Result;
    /**
     * Visit a parse tree produced by the `describeOutput`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDescribeOutput?: (ctx: DescribeOutputContext) => Result;
    /**
     * Visit a parse tree produced by the `setPath`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetPath?: (ctx: SetPathContext) => Result;
    /**
     * Visit a parse tree produced by the `setTimeZone`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetTimeZone?: (ctx: SetTimeZoneContext) => Result;
    /**
     * Visit a parse tree produced by the `update`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdate?: (ctx: UpdateContext) => Result;
    /**
     * Visit a parse tree produced by the `merge`
     * labeled alternative in `SqlBaseParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMerge?: (ctx: MergeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.query`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuery?: (ctx: QueryContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.with`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWith?: (ctx: WithContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.tableElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableElement?: (ctx: TableElementContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.columnDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitColumnDefinition?: (ctx: ColumnDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.likeClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLikeClause?: (ctx: LikeClauseContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.properties`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProperties?: (ctx: PropertiesContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.propertyAssignments`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPropertyAssignments?: (ctx: PropertyAssignmentsContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.property`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProperty?: (ctx: PropertyContext) => Result;
    /**
     * Visit a parse tree produced by the `defaultPropertyValue`
     * labeled alternative in `SqlBaseParser.propertyValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDefaultPropertyValue?: (ctx: DefaultPropertyValueContext) => Result;
    /**
     * Visit a parse tree produced by the `nonDefaultPropertyValue`
     * labeled alternative in `SqlBaseParser.propertyValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNonDefaultPropertyValue?: (ctx: NonDefaultPropertyValueContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.queryNoWith`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryNoWith?: (ctx: QueryNoWithContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.limitRowCount`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLimitRowCount?: (ctx: LimitRowCountContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.rowCount`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowCount?: (ctx: RowCountContext) => Result;
    /**
     * Visit a parse tree produced by the `queryTermDefault`
     * labeled alternative in `SqlBaseParser.queryTerm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryTermDefault?: (ctx: QueryTermDefaultContext) => Result;
    /**
     * Visit a parse tree produced by the `setOperation`
     * labeled alternative in `SqlBaseParser.queryTerm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetOperation?: (ctx: SetOperationContext) => Result;
    /**
     * Visit a parse tree produced by the `queryPrimaryDefault`
     * labeled alternative in `SqlBaseParser.queryPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryPrimaryDefault?: (ctx: QueryPrimaryDefaultContext) => Result;
    /**
     * Visit a parse tree produced by the `table`
     * labeled alternative in `SqlBaseParser.queryPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTable?: (ctx: TableContext) => Result;
    /**
     * Visit a parse tree produced by the `inlineTable`
     * labeled alternative in `SqlBaseParser.queryPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInlineTable?: (ctx: InlineTableContext) => Result;
    /**
     * Visit a parse tree produced by the `subquery`
     * labeled alternative in `SqlBaseParser.queryPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubquery?: (ctx: SubqueryContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.sortItem`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSortItem?: (ctx: SortItemContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.querySpecification`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuerySpecification?: (ctx: QuerySpecificationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.groupBy`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupBy?: (ctx: GroupByContext) => Result;
    /**
     * Visit a parse tree produced by the `singleGroupingSet`
     * labeled alternative in `SqlBaseParser.groupingElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSingleGroupingSet?: (ctx: SingleGroupingSetContext) => Result;
    /**
     * Visit a parse tree produced by the `rollup`
     * labeled alternative in `SqlBaseParser.groupingElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRollup?: (ctx: RollupContext) => Result;
    /**
     * Visit a parse tree produced by the `cube`
     * labeled alternative in `SqlBaseParser.groupingElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCube?: (ctx: CubeContext) => Result;
    /**
     * Visit a parse tree produced by the `multipleGroupingSets`
     * labeled alternative in `SqlBaseParser.groupingElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultipleGroupingSets?: (ctx: MultipleGroupingSetsContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.groupingSet`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupingSet?: (ctx: GroupingSetContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.windowDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWindowDefinition?: (ctx: WindowDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.windowSpecification`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWindowSpecification?: (ctx: WindowSpecificationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.namedQuery`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedQuery?: (ctx: NamedQueryContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.setQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetQuantifier?: (ctx: SetQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by the `selectSingle`
     * labeled alternative in `SqlBaseParser.selectItem`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectSingle?: (ctx: SelectSingleContext) => Result;
    /**
     * Visit a parse tree produced by the `selectAll`
     * labeled alternative in `SqlBaseParser.selectItem`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectAll?: (ctx: SelectAllContext) => Result;
    /**
     * Visit a parse tree produced by the `relationDefault`
     * labeled alternative in `SqlBaseParser.relation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRelationDefault?: (ctx: RelationDefaultContext) => Result;
    /**
     * Visit a parse tree produced by the `joinRelation`
     * labeled alternative in `SqlBaseParser.relation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinRelation?: (ctx: JoinRelationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.joinType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinType?: (ctx: JoinTypeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.joinCriteria`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinCriteria?: (ctx: JoinCriteriaContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.sampledRelation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSampledRelation?: (ctx: SampledRelationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.sampleType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSampleType?: (ctx: SampleTypeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.trimsSpecification`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTrimsSpecification?: (ctx: TrimsSpecificationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.listAggOverflowBehavior`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitListAggOverflowBehavior?: (ctx: ListAggOverflowBehaviorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.listaggCountIndication`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitListaggCountIndication?: (ctx: ListaggCountIndicationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.patternRecognition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPatternRecognition?: (ctx: PatternRecognitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.measureDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMeasureDefinition?: (ctx: MeasureDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.rowsPerMatch`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowsPerMatch?: (ctx: RowsPerMatchContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.emptyMatchHandling`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEmptyMatchHandling?: (ctx: EmptyMatchHandlingContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.skipTo`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSkipTo?: (ctx: SkipToContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.subsetDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubsetDefinition?: (ctx: SubsetDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.variableDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariableDefinition?: (ctx: VariableDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.aliasedRelation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAliasedRelation?: (ctx: AliasedRelationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.columnAliases`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitColumnAliases?: (ctx: ColumnAliasesContext) => Result;
    /**
     * Visit a parse tree produced by the `tableName`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableName?: (ctx: TableNameContext) => Result;
    /**
     * Visit a parse tree produced by the `subqueryRelation`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubqueryRelation?: (ctx: SubqueryRelationContext) => Result;
    /**
     * Visit a parse tree produced by the `unnest`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnnest?: (ctx: UnnestContext) => Result;
    /**
     * Visit a parse tree produced by the `lateral`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLateral?: (ctx: LateralContext) => Result;
    /**
     * Visit a parse tree produced by the `tableFunctionInvocation`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableFunctionInvocation?: (ctx: TableFunctionInvocationContext) => Result;
    /**
     * Visit a parse tree produced by the `parenthesizedRelation`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParenthesizedRelation?: (ctx: ParenthesizedRelationContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonTable`
     * labeled alternative in `SqlBaseParser.relationPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonTable?: (ctx: JsonTableContext) => Result;
    /**
     * Visit a parse tree produced by the `ordinalityColumn`
     * labeled alternative in `SqlBaseParser.jsonTableColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrdinalityColumn?: (ctx: OrdinalityColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `valueColumn`
     * labeled alternative in `SqlBaseParser.jsonTableColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValueColumn?: (ctx: ValueColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `queryColumn`
     * labeled alternative in `SqlBaseParser.jsonTableColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryColumn?: (ctx: QueryColumnContext) => Result;
    /**
     * Visit a parse tree produced by the `nestedColumns`
     * labeled alternative in `SqlBaseParser.jsonTableColumn`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNestedColumns?: (ctx: NestedColumnsContext) => Result;
    /**
     * Visit a parse tree produced by the `leafPlan`
     * labeled alternative in `SqlBaseParser.jsonTableSpecificPlan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLeafPlan?: (ctx: LeafPlanContext) => Result;
    /**
     * Visit a parse tree produced by the `joinPlan`
     * labeled alternative in `SqlBaseParser.jsonTableSpecificPlan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJoinPlan?: (ctx: JoinPlanContext) => Result;
    /**
     * Visit a parse tree produced by the `unionPlan`
     * labeled alternative in `SqlBaseParser.jsonTableSpecificPlan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnionPlan?: (ctx: UnionPlanContext) => Result;
    /**
     * Visit a parse tree produced by the `crossPlan`
     * labeled alternative in `SqlBaseParser.jsonTableSpecificPlan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCrossPlan?: (ctx: CrossPlanContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonTablePathName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonTablePathName?: (ctx: JsonTablePathNameContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.planPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPlanPrimary?: (ctx: PlanPrimaryContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonTableDefaultPlan`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonTableDefaultPlan?: (ctx: JsonTableDefaultPlanContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.tableFunctionCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableFunctionCall?: (ctx: TableFunctionCallContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.tableFunctionArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableFunctionArgument?: (ctx: TableFunctionArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.tableArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableArgument?: (ctx: TableArgumentContext) => Result;
    /**
     * Visit a parse tree produced by the `tableArgumentTable`
     * labeled alternative in `SqlBaseParser.tableArgumentRelation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableArgumentTable?: (ctx: TableArgumentTableContext) => Result;
    /**
     * Visit a parse tree produced by the `tableArgumentQuery`
     * labeled alternative in `SqlBaseParser.tableArgumentRelation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTableArgumentQuery?: (ctx: TableArgumentQueryContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.descriptorArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDescriptorArgument?: (ctx: DescriptorArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.descriptorField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDescriptorField?: (ctx: DescriptorFieldContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.copartitionTables`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCopartitionTables?: (ctx: CopartitionTablesContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpression?: (ctx: ExpressionContext) => Result;
    /**
     * Visit a parse tree produced by the `logicalNot`
     * labeled alternative in `SqlBaseParser.booleanExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalNot?: (ctx: LogicalNotContext) => Result;
    /**
     * Visit a parse tree produced by the `predicated`
     * labeled alternative in `SqlBaseParser.booleanExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPredicated?: (ctx: PredicatedContext) => Result;
    /**
     * Visit a parse tree produced by the `or`
     * labeled alternative in `SqlBaseParser.booleanExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOr?: (ctx: OrContext) => Result;
    /**
     * Visit a parse tree produced by the `and`
     * labeled alternative in `SqlBaseParser.booleanExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnd?: (ctx: AndContext) => Result;
    /**
     * Visit a parse tree produced by the `comparison`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparison?: (ctx: ComparisonContext) => Result;
    /**
     * Visit a parse tree produced by the `quantifiedComparison`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuantifiedComparison?: (ctx: QuantifiedComparisonContext) => Result;
    /**
     * Visit a parse tree produced by the `between`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBetween?: (ctx: BetweenContext) => Result;
    /**
     * Visit a parse tree produced by the `inList`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInList?: (ctx: InListContext) => Result;
    /**
     * Visit a parse tree produced by the `inSubquery`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInSubquery?: (ctx: InSubqueryContext) => Result;
    /**
     * Visit a parse tree produced by the `like`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLike?: (ctx: LikeContext) => Result;
    /**
     * Visit a parse tree produced by the `nullPredicate`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNullPredicate?: (ctx: NullPredicateContext) => Result;
    /**
     * Visit a parse tree produced by the `distinctFrom`
     * labeled alternative in `SqlBaseParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDistinctFrom?: (ctx: DistinctFromContext) => Result;
    /**
     * Visit a parse tree produced by the `valueExpressionDefault`
     * labeled alternative in `SqlBaseParser.valueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValueExpressionDefault?: (ctx: ValueExpressionDefaultContext) => Result;
    /**
     * Visit a parse tree produced by the `concatenation`
     * labeled alternative in `SqlBaseParser.valueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConcatenation?: (ctx: ConcatenationContext) => Result;
    /**
     * Visit a parse tree produced by the `arithmeticBinary`
     * labeled alternative in `SqlBaseParser.valueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArithmeticBinary?: (ctx: ArithmeticBinaryContext) => Result;
    /**
     * Visit a parse tree produced by the `arithmeticUnary`
     * labeled alternative in `SqlBaseParser.valueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArithmeticUnary?: (ctx: ArithmeticUnaryContext) => Result;
    /**
     * Visit a parse tree produced by the `atTimeZone`
     * labeled alternative in `SqlBaseParser.valueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtTimeZone?: (ctx: AtTimeZoneContext) => Result;
    /**
     * Visit a parse tree produced by the `dereference`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDereference?: (ctx: DereferenceContext) => Result;
    /**
     * Visit a parse tree produced by the `typeConstructor`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeConstructor?: (ctx: TypeConstructorContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonValue`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonValue?: (ctx: JsonValueContext) => Result;
    /**
     * Visit a parse tree produced by the `specialDateTimeFunction`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSpecialDateTimeFunction?: (ctx: SpecialDateTimeFunctionContext) => Result;
    /**
     * Visit a parse tree produced by the `substring`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubstring?: (ctx: SubstringContext) => Result;
    /**
     * Visit a parse tree produced by the `cast`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCast?: (ctx: CastContext) => Result;
    /**
     * Visit a parse tree produced by the `lambda`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLambda?: (ctx: LambdaContext) => Result;
    /**
     * Visit a parse tree produced by the `parenthesizedExpression`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParenthesizedExpression?: (ctx: ParenthesizedExpressionContext) => Result;
    /**
     * Visit a parse tree produced by the `trim`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTrim?: (ctx: TrimContext) => Result;
    /**
     * Visit a parse tree produced by the `parameter`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameter?: (ctx: ParameterContext) => Result;
    /**
     * Visit a parse tree produced by the `normalize`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNormalize?: (ctx: NormalizeContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonObject`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonObject?: (ctx: JsonObjectContext) => Result;
    /**
     * Visit a parse tree produced by the `intervalLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntervalLiteral?: (ctx: IntervalLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `numericLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumericLiteral?: (ctx: NumericLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `booleanLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonArray`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonArray?: (ctx: JsonArrayContext) => Result;
    /**
     * Visit a parse tree produced by the `simpleCase`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimpleCase?: (ctx: SimpleCaseContext) => Result;
    /**
     * Visit a parse tree produced by the `columnReference`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitColumnReference?: (ctx: ColumnReferenceContext) => Result;
    /**
     * Visit a parse tree produced by the `nullLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNullLiteral?: (ctx: NullLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `rowConstructor`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowConstructor?: (ctx: RowConstructorContext) => Result;
    /**
     * Visit a parse tree produced by the `subscript`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubscript?: (ctx: SubscriptContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonExists`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonExists?: (ctx: JsonExistsContext) => Result;
    /**
     * Visit a parse tree produced by the `currentPath`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentPath?: (ctx: CurrentPathContext) => Result;
    /**
     * Visit a parse tree produced by the `subqueryExpression`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubqueryExpression?: (ctx: SubqueryExpressionContext) => Result;
    /**
     * Visit a parse tree produced by the `binaryLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBinaryLiteral?: (ctx: BinaryLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `currentUser`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentUser?: (ctx: CurrentUserContext) => Result;
    /**
     * Visit a parse tree produced by the `jsonQuery`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonQuery?: (ctx: JsonQueryContext) => Result;
    /**
     * Visit a parse tree produced by the `measure`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMeasure?: (ctx: MeasureContext) => Result;
    /**
     * Visit a parse tree produced by the `extract`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtract?: (ctx: ExtractContext) => Result;
    /**
     * Visit a parse tree produced by the `stringLiteral`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringLiteral?: (ctx: StringLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `arrayConstructor`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayConstructor?: (ctx: ArrayConstructorContext) => Result;
    /**
     * Visit a parse tree produced by the `functionCall`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionCall?: (ctx: FunctionCallContext) => Result;
    /**
     * Visit a parse tree produced by the `currentSchema`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentSchema?: (ctx: CurrentSchemaContext) => Result;
    /**
     * Visit a parse tree produced by the `exists`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExists?: (ctx: ExistsContext) => Result;
    /**
     * Visit a parse tree produced by the `position`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPosition?: (ctx: PositionContext) => Result;
    /**
     * Visit a parse tree produced by the `listagg`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitListagg?: (ctx: ListaggContext) => Result;
    /**
     * Visit a parse tree produced by the `searchedCase`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchedCase?: (ctx: SearchedCaseContext) => Result;
    /**
     * Visit a parse tree produced by the `currentCatalog`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentCatalog?: (ctx: CurrentCatalogContext) => Result;
    /**
     * Visit a parse tree produced by the `groupingOperation`
     * labeled alternative in `SqlBaseParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupingOperation?: (ctx: GroupingOperationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonPathInvocation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonPathInvocation?: (ctx: JsonPathInvocationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonValueExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonValueExpression?: (ctx: JsonValueExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonRepresentation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonRepresentation?: (ctx: JsonRepresentationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonArgument?: (ctx: JsonArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonExistsErrorBehavior`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonExistsErrorBehavior?: (ctx: JsonExistsErrorBehaviorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonValueBehavior`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonValueBehavior?: (ctx: JsonValueBehaviorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonQueryWrapperBehavior`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonQueryWrapperBehavior?: (ctx: JsonQueryWrapperBehaviorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonQueryBehavior`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonQueryBehavior?: (ctx: JsonQueryBehaviorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.jsonObjectMember`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJsonObjectMember?: (ctx: JsonObjectMemberContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.processingMode`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProcessingMode?: (ctx: ProcessingModeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.nullTreatment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNullTreatment?: (ctx: NullTreatmentContext) => Result;
    /**
     * Visit a parse tree produced by the `basicStringLiteral`
     * labeled alternative in `SqlBaseParser.string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBasicStringLiteral?: (ctx: BasicStringLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `unicodeStringLiteral`
     * labeled alternative in `SqlBaseParser.string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnicodeStringLiteral?: (ctx: UnicodeStringLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `timeZoneInterval`
     * labeled alternative in `SqlBaseParser.timeZoneSpecifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTimeZoneInterval?: (ctx: TimeZoneIntervalContext) => Result;
    /**
     * Visit a parse tree produced by the `timeZoneString`
     * labeled alternative in `SqlBaseParser.timeZoneSpecifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTimeZoneString?: (ctx: TimeZoneStringContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.comparisonOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparisonOperator?: (ctx: ComparisonOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.comparisonQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparisonQuantifier?: (ctx: ComparisonQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.booleanValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBooleanValue?: (ctx: BooleanValueContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.interval`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterval?: (ctx: IntervalContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.intervalField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntervalField?: (ctx: IntervalFieldContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.normalForm`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNormalForm?: (ctx: NormalFormContext) => Result;
    /**
     * Visit a parse tree produced by the `rowType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowType?: (ctx: RowTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `intervalType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntervalType?: (ctx: IntervalTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `arrayType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayType?: (ctx: ArrayTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `doublePrecisionType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDoublePrecisionType?: (ctx: DoublePrecisionTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `legacyArrayType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLegacyArrayType?: (ctx: LegacyArrayTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `genericType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGenericType?: (ctx: GenericTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `dateTimeType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDateTimeType?: (ctx: DateTimeTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `legacyMapType`
     * labeled alternative in `SqlBaseParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLegacyMapType?: (ctx: LegacyMapTypeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.rowField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRowField?: (ctx: RowFieldContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.typeParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeParameter?: (ctx: TypeParameterContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.whenClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhenClause?: (ctx: WhenClauseContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.filter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFilter?: (ctx: FilterContext) => Result;
    /**
     * Visit a parse tree produced by the `mergeUpdate`
     * labeled alternative in `SqlBaseParser.mergeCase`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMergeUpdate?: (ctx: MergeUpdateContext) => Result;
    /**
     * Visit a parse tree produced by the `mergeDelete`
     * labeled alternative in `SqlBaseParser.mergeCase`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMergeDelete?: (ctx: MergeDeleteContext) => Result;
    /**
     * Visit a parse tree produced by the `mergeInsert`
     * labeled alternative in `SqlBaseParser.mergeCase`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMergeInsert?: (ctx: MergeInsertContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.over`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOver?: (ctx: OverContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.windowFrame`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWindowFrame?: (ctx: WindowFrameContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.frameExtent`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFrameExtent?: (ctx: FrameExtentContext) => Result;
    /**
     * Visit a parse tree produced by the `unboundedFrame`
     * labeled alternative in `SqlBaseParser.frameBound`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnboundedFrame?: (ctx: UnboundedFrameContext) => Result;
    /**
     * Visit a parse tree produced by the `currentRowBound`
     * labeled alternative in `SqlBaseParser.frameBound`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentRowBound?: (ctx: CurrentRowBoundContext) => Result;
    /**
     * Visit a parse tree produced by the `boundedFrame`
     * labeled alternative in `SqlBaseParser.frameBound`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBoundedFrame?: (ctx: BoundedFrameContext) => Result;
    /**
     * Visit a parse tree produced by the `quantifiedPrimary`
     * labeled alternative in `SqlBaseParser.rowPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuantifiedPrimary?: (ctx: QuantifiedPrimaryContext) => Result;
    /**
     * Visit a parse tree produced by the `patternConcatenation`
     * labeled alternative in `SqlBaseParser.rowPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPatternConcatenation?: (ctx: PatternConcatenationContext) => Result;
    /**
     * Visit a parse tree produced by the `patternAlternation`
     * labeled alternative in `SqlBaseParser.rowPattern`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPatternAlternation?: (ctx: PatternAlternationContext) => Result;
    /**
     * Visit a parse tree produced by the `patternVariable`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPatternVariable?: (ctx: PatternVariableContext) => Result;
    /**
     * Visit a parse tree produced by the `emptyPattern`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEmptyPattern?: (ctx: EmptyPatternContext) => Result;
    /**
     * Visit a parse tree produced by the `patternPermutation`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPatternPermutation?: (ctx: PatternPermutationContext) => Result;
    /**
     * Visit a parse tree produced by the `groupedPattern`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupedPattern?: (ctx: GroupedPatternContext) => Result;
    /**
     * Visit a parse tree produced by the `partitionStartAnchor`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionStartAnchor?: (ctx: PartitionStartAnchorContext) => Result;
    /**
     * Visit a parse tree produced by the `partitionEndAnchor`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPartitionEndAnchor?: (ctx: PartitionEndAnchorContext) => Result;
    /**
     * Visit a parse tree produced by the `excludedPattern`
     * labeled alternative in `SqlBaseParser.patternPrimary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExcludedPattern?: (ctx: ExcludedPatternContext) => Result;
    /**
     * Visit a parse tree produced by the `zeroOrMoreQuantifier`
     * labeled alternative in `SqlBaseParser.patternQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitZeroOrMoreQuantifier?: (ctx: ZeroOrMoreQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by the `oneOrMoreQuantifier`
     * labeled alternative in `SqlBaseParser.patternQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOneOrMoreQuantifier?: (ctx: OneOrMoreQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by the `zeroOrOneQuantifier`
     * labeled alternative in `SqlBaseParser.patternQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitZeroOrOneQuantifier?: (ctx: ZeroOrOneQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by the `rangeQuantifier`
     * labeled alternative in `SqlBaseParser.patternQuantifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRangeQuantifier?: (ctx: RangeQuantifierContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.updateAssignment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdateAssignment?: (ctx: UpdateAssignmentContext) => Result;
    /**
     * Visit a parse tree produced by the `explainFormat`
     * labeled alternative in `SqlBaseParser.explainOption`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExplainFormat?: (ctx: ExplainFormatContext) => Result;
    /**
     * Visit a parse tree produced by the `explainType`
     * labeled alternative in `SqlBaseParser.explainOption`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExplainType?: (ctx: ExplainTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `isolationLevel`
     * labeled alternative in `SqlBaseParser.transactionMode`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIsolationLevel?: (ctx: IsolationLevelContext) => Result;
    /**
     * Visit a parse tree produced by the `transactionAccessMode`
     * labeled alternative in `SqlBaseParser.transactionMode`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTransactionAccessMode?: (ctx: TransactionAccessModeContext) => Result;
    /**
     * Visit a parse tree produced by the `readUncommitted`
     * labeled alternative in `SqlBaseParser.levelOfIsolation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReadUncommitted?: (ctx: ReadUncommittedContext) => Result;
    /**
     * Visit a parse tree produced by the `readCommitted`
     * labeled alternative in `SqlBaseParser.levelOfIsolation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReadCommitted?: (ctx: ReadCommittedContext) => Result;
    /**
     * Visit a parse tree produced by the `repeatableRead`
     * labeled alternative in `SqlBaseParser.levelOfIsolation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRepeatableRead?: (ctx: RepeatableReadContext) => Result;
    /**
     * Visit a parse tree produced by the `serializable`
     * labeled alternative in `SqlBaseParser.levelOfIsolation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSerializable?: (ctx: SerializableContext) => Result;
    /**
     * Visit a parse tree produced by the `positionalArgument`
     * labeled alternative in `SqlBaseParser.callArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPositionalArgument?: (ctx: PositionalArgumentContext) => Result;
    /**
     * Visit a parse tree produced by the `namedArgument`
     * labeled alternative in `SqlBaseParser.callArgument`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNamedArgument?: (ctx: NamedArgumentContext) => Result;
    /**
     * Visit a parse tree produced by the `qualifiedArgument`
     * labeled alternative in `SqlBaseParser.pathElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQualifiedArgument?: (ctx: QualifiedArgumentContext) => Result;
    /**
     * Visit a parse tree produced by the `unqualifiedArgument`
     * labeled alternative in `SqlBaseParser.pathElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnqualifiedArgument?: (ctx: UnqualifiedArgumentContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.pathSpecification`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPathSpecification?: (ctx: PathSpecificationContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.privilege`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrivilege?: (ctx: PrivilegeContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.qualifiedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQualifiedName?: (ctx: QualifiedNameContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.queryPeriod`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQueryPeriod?: (ctx: QueryPeriodContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.rangeType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRangeType?: (ctx: RangeTypeContext) => Result;
    /**
     * Visit a parse tree produced by the `specifiedPrincipal`
     * labeled alternative in `SqlBaseParser.grantor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSpecifiedPrincipal?: (ctx: SpecifiedPrincipalContext) => Result;
    /**
     * Visit a parse tree produced by the `currentUserGrantor`
     * labeled alternative in `SqlBaseParser.grantor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentUserGrantor?: (ctx: CurrentUserGrantorContext) => Result;
    /**
     * Visit a parse tree produced by the `currentRoleGrantor`
     * labeled alternative in `SqlBaseParser.grantor`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCurrentRoleGrantor?: (ctx: CurrentRoleGrantorContext) => Result;
    /**
     * Visit a parse tree produced by the `unspecifiedPrincipal`
     * labeled alternative in `SqlBaseParser.principal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnspecifiedPrincipal?: (ctx: UnspecifiedPrincipalContext) => Result;
    /**
     * Visit a parse tree produced by the `userPrincipal`
     * labeled alternative in `SqlBaseParser.principal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUserPrincipal?: (ctx: UserPrincipalContext) => Result;
    /**
     * Visit a parse tree produced by the `rolePrincipal`
     * labeled alternative in `SqlBaseParser.principal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRolePrincipal?: (ctx: RolePrincipalContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.roles`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRoles?: (ctx: RolesContext) => Result;
    /**
     * Visit a parse tree produced by the `unquotedIdentifier`
     * labeled alternative in `SqlBaseParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnquotedIdentifier?: (ctx: UnquotedIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by the `quotedIdentifier`
     * labeled alternative in `SqlBaseParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuotedIdentifier?: (ctx: QuotedIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by the `backQuotedIdentifier`
     * labeled alternative in `SqlBaseParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBackQuotedIdentifier?: (ctx: BackQuotedIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by the `digitIdentifier`
     * labeled alternative in `SqlBaseParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDigitIdentifier?: (ctx: DigitIdentifierContext) => Result;
    /**
     * Visit a parse tree produced by the `decimalLiteral`
     * labeled alternative in `SqlBaseParser.number`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDecimalLiteral?: (ctx: DecimalLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `doubleLiteral`
     * labeled alternative in `SqlBaseParser.number`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDoubleLiteral?: (ctx: DoubleLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `integerLiteral`
     * labeled alternative in `SqlBaseParser.number`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntegerLiteral?: (ctx: IntegerLiteralContext) => Result;
    /**
     * Visit a parse tree produced by the `identifierUser`
     * labeled alternative in `SqlBaseParser.authorizationUser`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifierUser?: (ctx: IdentifierUserContext) => Result;
    /**
     * Visit a parse tree produced by the `stringUser`
     * labeled alternative in `SqlBaseParser.authorizationUser`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStringUser?: (ctx: StringUserContext) => Result;
    /**
     * Visit a parse tree produced by `SqlBaseParser.nonReserved`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNonReserved?: (ctx: NonReservedContext) => Result;
}

