import React from 'react'
import { Box, Stack, Tooltip, IconButton } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import Maximize from '@mui/icons-material/Maximize'
import Minimize from '@mui/icons-material/Minimize'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import Queries from './schema/Queries'
import QueryInfo from './schema/QueryInfo'
import EnterpriseTabs from './controls/tabs/EnterpriseTabs'
import * as c3 from 'antlr4-c3'
import { CharStream, CommonTokenStream, TerminalNode, ParseTree, ParserRuleContext } from 'antlr4ng'
import { TableNameContext } from './generated/lexer/SqlBase.g4/SqlBaseParser'
import { SqlBaseLexer } from './generated/lexer/SqlBase.g4/SqlBaseLexer'
import { SqlBaseParser } from './generated/lexer/SqlBase.g4/SqlBaseParser'
import SqlBaseErrorListener from './sql/SqlBaseErrorListener'
import SqlBaseListenerImpl from './sql/SqlBaseListenerImpl'
import StatementDescriptor from './sql/StatementDescriptor'
import SchemaProvider from './sql/SchemaProvider'
import TableReference from './schema/TableReference'
import Table from './schema/Table'
import Column from './schema/Column'
import NamedQuery from './sql/NamedQuery'
import { tokenMap } from './sql/TokenMap'
import SubstitutionEditor from './SubstitutionEditor'
import { format } from 'sql-formatter'

const TRINO_SQL_LANGUAGE = 'trinosql'
const TABS_HEIGHT = 64

interface QueryEditorPaneProps {
    queries: Queries
    maxHeight: number
    onQueryChange: (query: string) => void
    onSelectChange: (selectedText: string) => void
    onExecute: () => void
    catalog?: string
    schema?: string
    theme?: string
}

interface QueryEditorPaneState {
    currentQuery: QueryInfo | null
    substitutions: Record<string, string>
    isMaximized: boolean
    height: number
    width: string
}

// create a private class that extends CompletionItem
// this class will be used to create the completion items
// for the monaco editor
class CompletionItemImpl implements monaco.languages.CompletionItem {
    label: string
    kind: monaco.languages.CompletionItemKind
    tags?: readonly monaco.languages.CompletionItemTag[] | undefined
    detail?: string | undefined
    sortText?: string | undefined
    filterText?: string | undefined
    preselect?: boolean | undefined
    insertText: string
    insertTextRules?: monaco.languages.CompletionItemInsertTextRule | undefined
    range: monaco.IRange | monaco.languages.CompletionItemRanges
    commitCharacters?: string[] | undefined
    additionalTextEdits?: monaco.editor.ISingleEditOperation[] | undefined
    command?: monaco.languages.Command | undefined

    constructor(
        label: string,
        kind: monaco.languages.CompletionItemKind,
        insertText: string,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule,
        range: monaco.IRange | monaco.languages.CompletionItemRanges
    ) {
        this.label = label
        this.kind = kind
        this.insertText = insertText
        this.insertTextRules = insertTextRules
        this.preselect = false
        // single line
        this.range = range
    }
}

class CustomTokenizerState implements monaco.languages.IState {
    clone(): monaco.languages.IState {
        return new CustomTokenizerState()
    }

    equals(other: monaco.languages.IState): boolean {
        return other instanceof CustomTokenizerState
    }
}

class QueryEditorPane extends React.Component<QueryEditorPaneProps, QueryEditorPaneState> {
    private editorRef: monaco.editor.IStandaloneCodeEditor | null = null
    private isRunningParse: boolean = false
    private updateCounter: number = 0
    private parseCancelToken: { cancel: boolean } = { cancel: false }
    private lastCompletionItemsPosition: monaco.Position | undefined = undefined
    private completionItems: monaco.languages.CompletionItem[] = []

    openModel: any = null
    decorations: any = null
    state: QueryEditorPaneState

    constructor(props: QueryEditorPaneProps) {
        super(props)
        this.state = {
            currentQuery: props.queries.getCurrentQuery(),
            substitutions: {},
            isMaximized: false,
            height: this.props.maxHeight / 2,
            width: '100%',
        }
    }

    setEditorRef = (editor: monaco.editor.IStandaloneCodeEditor) => {
        this.editorRef = editor
    }

    componentDidMount() {
        this.props.queries.addChangeListener(this.handleQueriesChange)
    }

    componentDidUpdate(prevProps: QueryEditorPaneProps) {
        if (prevProps.maxHeight !== this.props.maxHeight) {
            this.handleHeightChange(this.props.maxHeight)
        }
    }

    componentWillUnmount() {
        this.props.queries.removeChangeListener(this.handleQueriesChange)
    }

    handleQueriesChange = () => {
        this.setState({
            currentQuery: this.props.queries.getCurrentQuery(),
        })
    }

    handleTabChange = (queryId: string) => {
        this.props.queries.setCurrentQuery(queryId)
        if (this.editorRef) {
            const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${queryId}`))
            if (model) {
                this.editorRef.setModel(model)
            }
        }
    }

    handleTabSelectAndPromote = (queryId: string) => {
        this.props.queries.moveQueryToFront(queryId)
        this.props.queries.setCurrentQuery(queryId)
    }

    handleTabCreate = () => {
        const newQuery = this.props.queries.addQuery(false, 'New query')
        monaco.editor.createModel('', TRINO_SQL_LANGUAGE, monaco.Uri.parse(`file:///${newQuery.id}`))
        this.props.queries.setCurrentQuery(newQuery.id)
        return newQuery.id
    }

    handleTabClose = (id: string) => {
        this.props.queries.deleteQuery(id)
        const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${id}`))
        if (model) {
            model.dispose()
        }
    }

    handleTabRename = (id: string, newTitle: string) => {
        this.props.queries.updateQuery(id, { title: newTitle })
    }

    handleEditorChange = (newQuery: string | undefined) => {
        if (newQuery !== undefined && this.state.currentQuery) {
            this.props.queries.updateQuery(this.state.currentQuery.id, { query: newQuery })
            this.props.onQueryChange(newQuery)
        }
    }

    handleSubstitutionChange = (newSubstitutions: Record<string, string>) => {
        this.setState({ substitutions: newSubstitutions })
    }

    toggleMaximize = () => {
        this.setState((prevState) => ({
            isMaximized: !prevState.isMaximized,
            height: !prevState.isMaximized ? this.props.maxHeight : this.props.maxHeight / 2,
            width: '100%',
        }))
    }

    // method to get contents of react editor
    getContent() {
        return this.openModel.getValue()
    }

    async parseAndDecoratePromiseAsync(monaco: any, editor: any, waitForUserToStopTyping: number): Promise<boolean> {
        if (this.isRunningParse) {
            //console.error("cancelled parsing:" + this.isRunningParse);
            return false
        }

        this.isRunningParse = true
        this.parseCancelToken.cancel = false

        try {
            let lastUpdateCounter = 0

            // Wait for the user to stop typing before parsing
            do {
                await new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        this.parseCancelToken.cancel ? reject(new Error('Parsing cancelled')) : resolve()
                    }, waitForUserToStopTyping)
                })
                lastUpdateCounter = this.updateCounter
            } while (lastUpdateCounter !== this.updateCounter)

            if (this.parseCancelToken.cancel) {
                //console.error("cancelled parsing");
                return false
            }

            // Call sync method
            return this.parseAndDecoratePromise(monaco, editor, lastUpdateCounter)
        } catch (error) {
            //console.error(error);
            return false
        } finally {
            this.isRunningParse = false
            //console.error("end parsing:" + this.isRunningParse);
        }
    }

    // Takes the editor and parses the text, then decorates the editor with errors, autocomplete, and special syntax highlighting
    parseAndDecoratePromise(monaco: any, editor: any, lastUpdateCounter: number): boolean {
        const newValue: string = editor.getValue()
        const lines: string[] = newValue.split('\n')
        const caretPosition: monaco.Position = editor.getPosition()

        // Gather information about the cursor position
        let currentWord = ''
        const currentLine: string = lines[caretPosition.lineNumber - 1]
        // note: column is 1 indexed, so current position is - 1, previous character is - 2
        const isCursorSurroundedBySpaces =
            currentLine[caretPosition.column - 2] == ' ' &&
            (currentLine[caretPosition.column - 1] == ' ' || caretPosition.column == currentLine.length + 1)
        let startWordColumn = caretPosition.column
        let endWord = caretPosition.column - 1
        // get characters before the current word
        // The cursor position after typing a word is at the end of the word, like this: `word|`
        // So: - start -1 to get the last character of the word to the left
        //     - then -1 because the column is 1 indexed
        for (let i = caretPosition.column - 1; i >= 1; i--) {
            if (currentLine[i - 1] == ' ' || currentLine[i - 1] == ',') {
                break
            }
            currentWord = currentLine[i - 1] + currentWord
            startWordColumn = i
        }

        // get characters after the current word
        for (let i = caretPosition.column; i < currentLine.length; i++) {
            if (currentLine[i - 1] == ' ' || currentLine[i - 1] == ',') {
                break
            }
            currentWord += currentLine[i - 1]
            endWord = i
        }

        const inputStream = CharStream.fromString(newValue)
        const lexer = new SqlBaseLexer(inputStream)
        const tokenStream = new CommonTokenStream(lexer)
        const parser = new SqlBaseParser(tokenStream)

        // Pass the current catalog and schema to the listener
        const listener = new SqlBaseListenerImpl(this.props.catalog, this.props.schema)

        parser.addParseListener(listener)
        // Remove default error listeners for SQL and add our custom one
        parser.removeErrorListeners()
        const errors: SqlBaseErrorListener = new SqlBaseErrorListener()
        parser.addErrorListener(errors)
        // Build a parsed structure for a single statement
        const tree = parser.singleStatement()

        let currentTreePosition: any = undefined
        let currentTreeIndex: number = 0

        let statements = listener.statements
        let namedQueries = listener.namedQueries
        currentTreePosition = this.parseTreeFromPosition(tree, caretPosition.column, caretPosition.lineNumber)
        if (statements.length == 0 && currentTreePosition == undefined) {
            // reconstruct input inserting an underscore at the cursor position
            const phantomKeyword: string = 'i'
            const newLine =
                currentLine.substring(0, caretPosition.column - 1) +
                phantomKeyword +
                currentLine.substring(caretPosition.column - 1)
            const newText =
                lines.slice(0, caretPosition.lineNumber - 1).join('\n') +
                newLine +
                (lines.length > caretPosition.lineNumber ? '\n' + lines.slice(caretPosition.lineNumber).join('\n') : '')

            const inputStreamWithChar = CharStream.fromString(newText)
            const lexerWithChar = new SqlBaseLexer(inputStreamWithChar)
            const tokenStreamWithChar = new CommonTokenStream(lexerWithChar)
            const parserWithChar = new SqlBaseParser(tokenStreamWithChar)
            const listenerWithChar = new SqlBaseListenerImpl(this.props.catalog, this.props.schema)
            parserWithChar.addParseListener(listenerWithChar)
            parserWithChar.removeErrorListeners()
            parserWithChar.addErrorListener(errors)
            const treeWithChar = parserWithChar.singleStatement()
            currentTreePosition = this.parseTreeFromPosition(
                treeWithChar,
                caretPosition.column - 1,
                caretPosition.lineNumber,
                ''
            )
            statements = listenerWithChar.statements
            namedQueries = listenerWithChar.namedQueries
            //console.log("created phantom");
        } else {
            // symbol covering caret position
            currentTreePosition = this.parseTreeFromPosition(tree, caretPosition.column, caretPosition.lineNumber)
        }

        if (currentTreePosition != undefined && currentTreePosition.symbol != undefined) {
            currentTreeIndex = currentTreePosition.symbol.tokenIndex
            //console.log("found symbol at " + currentTreePosition.symbol.tokenIndex);
        } else {
            currentTreeIndex = currentTreePosition.ruleIndex
        }

        const markers = errors.getMarkers()
        monaco.editor.setModelMarkers(editor.getModel(), 'owner', markers)

        // Add decorations for table names
        if (this.decorations) {
            this.decorations.clear()
        }
        this.decorations = editor.createDecorationsCollection(listener.getDecorations())

        // Autocomplete handling happend after the parse
        // Verify no typing
        if (this.updateCounter != lastUpdateCounter) {
            return false
        }

        const core = new c3.CodeCompletionCore(parser)
        core.showDebugOutput = false // logging debug info from parser

        // create a set of rules that should be used for code completion
        const ruleSet = new Set<number>([SqlBaseParser.RULE_selectItem])
        core.preferredRules = ruleSet

        const candidates = core.collectCandidates(currentTreeIndex)

        this.generateLexerAutocompleteCandidates(
            lines,
            parser,
            startWordColumn,
            endWord,
            caretPosition,
            monaco,
            editor,
            core,
            candidates,
            currentTreePosition,
            statements,
            namedQueries
        )

        this.isRunningParse = false
        return true
    }

    checkForParentOfContext(currentTreePosition: any, parentType: any): boolean {
        let current: any = currentTreePosition
        while (current) {
            if (current instanceof parentType) {
                return true
            }
            current = current.parent
        }

        return false
    }

    createCompletionItem(
        match: string,
        replace: string,
        caretPosition: monaco.Position,
        startWordColumn: number,
        endWordColumn: number
    ) {
        return {
            label: match,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: replace,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
            // Use Monaco's preferred format for ranges
            range: {
                startLineNumber: caretPosition.lineNumber,
                startColumn: startWordColumn,
                endLineNumber: caretPosition.lineNumber,
                endColumn: Math.max(startWordColumn, caretPosition.column), // Use at least the cursor position
            },
        }
    }

    generateLexerAutocompleteCandidates(
        lines: string[],
        parser: SqlBaseParser,
        startWordColumn: number,
        endWord: number,
        caretPosition: monaco.Position,
        monaco: any,
        editor: any,
        core: any,
        candidates: any,
        currentTreePosition: any,
        statements: StatementDescriptor[],
        namedQueries: Map<string, NamedQuery>
    ) {
        // At the beginning:
        // console.log("Generating autocomplete candidates");
        // console.log("Word bounds passed:", startWordColumn, "to", endWord);
        const endWordLineOffset: number = endWord + 1

        const keywords: string[] = []
        const completionItems: CompletionItemImpl[] = []
        for (const candidate of candidates.tokens) {
            //var tokenType = parser.getTokenType(candidate[0]);
            let displayName = parser.vocabulary.getSymbolicName(candidate[0])

            if (candidate[1].length > 0) {
                for (const candidateId of candidate[1]) {
                    displayName += ' ' + parser.vocabulary.getSymbolicName(candidateId)
                }
            }

            if (displayName) {
                completionItems.push(
                    this.createCompletionItem(
                        displayName.toLowerCase(),
                        displayName.toLowerCase() + ' ',
                        caretPosition,
                        startWordColumn,
                        startWordColumn + displayName.length
                    )
                )
                if (displayName.toLowerCase() == 'select') {
                    completionItems.push(
                        this.createCompletionItem(
                            'select * from',
                            'select * from ',
                            caretPosition,
                            startWordColumn,
                            endWordLineOffset
                        )
                    )
                }
                if (displayName.toLowerCase() == 'limit') {
                    completionItems.push(
                        this.createCompletionItem(
                            'limit 5',
                            'limit 5',
                            caretPosition,
                            startWordColumn,
                            endWordLineOffset
                        )
                    )
                }
                if (displayName.toLowerCase() == 'with') {
                    completionItems.push(
                        this.createCompletionItem(
                            'with query as (select * from )',
                            'with query as (select * from )',
                            caretPosition,
                            startWordColumn,
                            endWordLineOffset
                        )
                    )
                }
            }
        }

        //console.log("Keyword completion items:", completionItems.length);

        // check if parent is the parser's TableNameContext
        if (this.checkForParentOfContext(currentTreePosition, TableNameContext)) {
            // loop through all tables in the catalog
            const tableNames: string[] = SchemaProvider.getTableNameList(undefined, undefined)
            for (const tableName of tableNames) {
                completionItems.push(
                    new CompletionItemImpl(
                        tableName,
                        monaco.languages.CompletionItemKind.Reference,
                        tableName,
                        monaco.languages.CompletionItemInsertTextRule.None,
                        {
                            startLineNumber: caretPosition.lineNumber,
                            startColumn: startWordColumn,
                            endLineNumber: caretPosition.lineNumber,
                            endColumn: endWordLineOffset,
                        }
                    )
                )
            }

            // add named queries
            for (const [key, value] of namedQueries) {
                completionItems.push(
                    new CompletionItemImpl(
                        key,
                        monaco.languages.CompletionItemKind.Reference,
                        key,
                        monaco.languages.CompletionItemInsertTextRule.None,
                        {
                            startLineNumber: caretPosition.lineNumber,
                            startColumn: startWordColumn,
                            endLineNumber: caretPosition.lineNumber,
                            endColumn: endWordLineOffset,
                        }
                    )
                )
            }
        }

        //console.log("After table names, completion items:", completionItems.length);
        for (const statement of statements) {
            console.log(statement)
            // log location of caret vs statement position
            console.log('caret: ' + caretPosition.column + ' ' + caretPosition.lineNumber)
            console.log('statement start: ' + statement.start.column + ' ' + statement.start.line)
            console.log('statement end: ' + statement.end.column + ' ' + statement.end.line)

            // if inside ColumnReferenceContext, we can use the table name to get the columns
            if (
                (caretPosition.column >= statement.start.column && statement.start.line == caretPosition.lineNumber) ||
                (caretPosition.column <= statement.end.column && statement.end.line == caretPosition.lineNumber) ||
                (caretPosition.lineNumber > statement.start.line && caretPosition.lineNumber < statement.end.line)
            ) {
                console.log('Found statement')

                const tableName: string = statement.tableName
                let tableReference: TableReference | undefined
                if (TableReference.isFullyQualified(tableName)) {
                    tableReference = TableReference.fromFullyQualified(tableName)
                } else if (this.props.catalog && this.props.schema) {
                    // Use current catalog and schema from props
                    tableReference = new TableReference(this.props.catalog, this.props.schema, tableName)
                }

                if (tableReference) {
                    SchemaProvider.getTableWithCache(tableReference, (table: Table) => {
                        for (const column of table.getColumns()) {
                            completionItems.push(
                                new CompletionItemImpl(
                                    column.getName(),
                                    monaco.languages.CompletionItemKind.Field,
                                    column.getName(),
                                    monaco.languages.CompletionItemInsertTextRule.None,
                                    {
                                        insert: {
                                            startLineNumber: caretPosition.lineNumber,
                                            startColumn: startWordColumn,
                                            endLineNumber: caretPosition.lineNumber,
                                            endColumn: endWordLineOffset,
                                        },
                                        replace: {
                                            startLineNumber: caretPosition.lineNumber,
                                            startColumn: startWordColumn,
                                            endLineNumber: caretPosition.lineNumber,
                                            endColumn: endWordLineOffset,
                                        },
                                    }
                                )
                            )
                        }

                        const singleListOfColumnsJoinedByCommas: string =
                            '\n    ' +
                            table
                                .getColumns()
                                .map((column: Column) => column.getName())
                                .join('\n   ,')

                        completionItems.push(
                            new CompletionItemImpl(
                                singleListOfColumnsJoinedByCommas,
                                monaco.languages.CompletionItemKind.Field,
                                singleListOfColumnsJoinedByCommas + ' ',
                                monaco.languages.CompletionItemInsertTextRule.None,
                                {
                                    insert: {
                                        startLineNumber: caretPosition.lineNumber,
                                        startColumn: startWordColumn,
                                        endLineNumber: caretPosition.lineNumber,
                                        endColumn: endWordLineOffset,
                                    },
                                    replace: {
                                        startLineNumber: caretPosition.lineNumber,
                                        startColumn: startWordColumn,
                                        endLineNumber: caretPosition.lineNumber,
                                        endColumn: endWordLineOffset,
                                    },
                                }
                            )
                        )
                    })
                }
            }
        }

        const selectNames: string[] = []
        for (const candidate of candidates.rules) {
            switch (candidate[0]) {
                case SqlBaseParser.RULE_selectItem: {
                    // unused
                }
            }
        }

        // Finally combine all found lists into one for the UI.
        // We do that in separate steps so that you can apply some ordering to each of your sub lists.
        // Then you also can order symbols groups as a whole depending their importance.
        // let candidates: string[] = [];
        // candidates.push(...keywords);
        // candidates.push(...functionNames);

        if (completionItems.length > 0) {
            this.completionItems = completionItems
            this.lastCompletionItemsPosition = caretPosition
        }

        // At the very end of the method:
        console.log('Final completion items:', completionItems.length)
    }

    cancelParsing() {
        //console.error("CANCEL");
        this.parseCancelToken.cancel = true
        this.isRunningParse = false
    }

    editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
        this.setEditorRef(editor)

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.props.onExecute()
        })

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            // execute the query on ctrl+enter
            this.props.onExecute()
        })

        editor.addAction({
            id: 'format-sql',
            label: 'Format SQL',
            keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
            contextMenuGroupId: 'modification',
            contextMenuOrder: 1.5,
            run: () => {
                this.formatSql()
            },
        })

        // Check if the provider is already registered
        if (!monaco.languages.getLanguages().some((lang: any) => lang.id === TRINO_SQL_LANGUAGE)) {
            monaco.languages.register({ id: TRINO_SQL_LANGUAGE })

            monaco.languages.setTokensProvider(TRINO_SQL_LANGUAGE, {
                getInitialState: () => new CustomTokenizerState(),
                tokenize: (line: any, state: any) => {
                    const inputStream = CharStream.fromString(line)
                    const lexer = new SqlBaseLexer(inputStream)
                    const tokenStream = new CommonTokenStream(lexer)
                    lexer.reset()

                    const tokens = []
                    let token = lexer.nextToken()
                    while (token.type !== SqlBaseLexer.EOF) {
                        tokens.push({
                            startIndex: token.start,
                            scopes: tokenMap[token.type as keyof typeof tokenMap] || 'identifier',
                        })
                        token = lexer.nextToken()
                    }

                    return { tokens, endState: state }
                },
            })

            monaco.languages.registerCompletionItemProvider(TRINO_SQL_LANGUAGE, {
                provideCompletionItems: async (model: any, position: any) => {
                    this.cancelParsing() // Cancel any ongoing parsing
                    const parseResult = await this.parseAndDecoratePromiseAsync(monaco, editor, 0)
                    if (
                        this.lastCompletionItemsPosition &&
                        this.lastCompletionItemsPosition.lineNumber == position.lineNumber &&
                        this.lastCompletionItemsPosition.column == position.column
                    ) {
                        return { suggestions: this.completionItems }
                    } else {
                        return { suggestions: [] } // either parsing failed or the position is not the same as the last parse
                    }
                },
            })
        }

        editor.onDidChangeModelContent(async (e: any) => {
            this.updateCounter++
            this.handleEditorChange(editor.getValue())
            await this.parseAndDecoratePromiseAsync(monaco, editor, 200).then((result) => {
                //console.log("done parsing");
            })
        })

        editor.onDidChangeCursorSelection(() => {
            const selection = editor.getSelection()
            if (selection == null) {
                return
            }
            if (selection.startLineNumber != selection.endLineNumber || selection.startColumn != selection.endColumn) {
                const model = editor.getModel()
                if (model) {
                    const selectedText = model.getValueInRange(selection)
                    this.props.onSelectChange(selectedText)
                }
            } else {
                this.props.onSelectChange(editor.getValue())
            }
        })

        // init the parser once to get the initial state
        this.parseAndDecoratePromiseAsync(monaco, editor, 0).then((result) => {
            //console.log("done parsing");
        })
    }

    parseTreeFromPosition(
        root: ParseTree,
        cursorColumnOffsetZero: number,
        row: number,
        phantomKeyword: string = ''
    ): any | undefined {
        // Does the root node actually contain the position? If not, we don't need to look further.
        if (root instanceof TerminalNode) {
            const terminal = root as TerminalNode
            const token = terminal.symbol
            if (token.line != row) return undefined
            //let tokenStop = token.column + (token.stop - token.start + 1);
            if (cursorColumnOffsetZero >= token.column && token.text !== phantomKeyword && token.text !== '<EOF>') {
                // all we care about is whether it's the last token after this one starts
                return terminal
            }
            return undefined
        } else {
            const context = root as ParserRuleContext
            if (!context.start || !context.stop) {
                // Invalid tree?
                return undefined
            }

            let result = undefined
            if (context.children) {
                let lastresult = undefined
                for (const child of context.children) {
                    result = this.parseTreeFromPosition(child, cursorColumnOffsetZero, row, phantomKeyword)
                    if (result == undefined && lastresult != undefined) {
                        return lastresult
                    }
                    lastresult = result
                }
                if (result != undefined) {
                    return result
                }
            }

            if (
                context.children &&
                context.children.length > 1 &&
                context.children[0].getText() !== phantomKeyword &&
                context.children[0].getText() !== '<EOF>'
            ) {
                return context.children[0]
            } else {
                return undefined
            }
        }
    }

    // Format the entire SQL query
    formatSql = () => {
        if (this.editorRef) {
            const currentValue = this.editorRef.getValue()

            try {
                const config = {
                    indent: '  ',
                    uppercase: true,
                    linesBetweenQueries: 2,
                }
                const formattedSql = format(currentValue, config)

                // Replace the entire editor content with the formatted SQL
                this.editorRef.setValue(formattedSql)

                // Trigger a save to update the query in state
                this.handleEditorChange(formattedSql)
            } catch (error) {
                console.error('Error formatting SQL:', error)
            }
        }
    }

    // Format only the selected text
    formatSelection = () => {
        if (this.editorRef) {
            const selection = this.editorRef.getSelection()
            if (!selection || selection.isEmpty()) {
                // No selection, format the entire query
                this.formatSql()
                return
            }

            const model = this.editorRef.getModel()
            if (model) {
                const selectedText = model.getValueInRange(selection)
                try {
                    // Format just the selected text
                    const config = {
                        indent: '  ',
                        uppercase: true,
                        linesBetweenQueries: 2,
                    }
                    const formattedSql = format(selectedText, config)

                    // Replace just the selected part
                    this.editorRef.executeEdits('format-selection', [
                        {
                            range: selection,
                            text: formattedSql,
                            forceMoveMarkers: true,
                        },
                    ])
                } catch (error) {
                    console.error('Error formatting selection:', error)
                }
            }
        }
    }

    handleHeightChange = (maxHeight: number) => {
        this.setState({ height: this.state.isMaximized ? maxHeight : maxHeight / 2 })
    }

    render() {
        const options = {
            selectOnLineNumbers: true,
        }

        const { currentQuery, isMaximized, height, width } = this.state

        return (
            <>
                <EnterpriseTabs
                    tabs={this.props.queries}
                    onTabChange={this.handleTabChange}
                    onTabCreate={this.handleTabCreate}
                    onTabClose={this.handleTabClose}
                    onTabRename={this.handleTabRename}
                    onTabSelectAndPromote={this.handleTabSelectAndPromote}
                />
                <SubstitutionEditor
                    query={this.state.currentQuery?.query || ''}
                    onSubstitutionChange={this.handleSubstitutionChange}
                />
                <Box sx={{ position: 'relative', width: '100%' }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={(theme) => ({
                            position: 'absolute',
                            alignItems: 'center',
                            background: theme.palette.background.default,
                            border: 1,
                            borderColor: theme.palette.divider,
                            boxShadow: 1,
                            px: 0.5,
                            top: 0,
                            right: 15,
                            zIndex: 1000,
                        })}
                    >
                        <Tooltip title="Format SQL (Alt+Shift+F)">
                            <IconButton size="small" onClick={this.formatSql}>
                                <CodeIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isMaximized ? 'Minimize' : 'Maximize'}>
                            <IconButton size="small" onClick={this.toggleMaximize}>
                                {isMaximized ? (
                                    <Minimize sx={{ fontSize: '1.2rem' }} />
                                ) : (
                                    <Maximize sx={{ fontSize: '1.2rem' }} />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Box
                        sx={{
                            height: height - TABS_HEIGHT,
                        }}
                    >
                        <Editor
                            height={'100%'}
                            width={width}
                            language="trinosql"
                            theme={this.props.theme === 'dark' ? 'vs-dark' : 'vss'}
                            value={currentQuery?.query || ''}
                            options={{
                                automaticLayout: true,
                                selectOnLineNumbers: true,
                                minimap: { enabled: isMaximized },
                                // Add these options for better editing experience
                                formatOnPaste: true,
                                formatOnType: false,
                                autoIndent: 'full',
                            }}
                            onMount={this.editorDidMount}
                            onChange={this.handleEditorChange}
                        />
                    </Box>
                </Box>
            </>
        )
    }
}

export default QueryEditorPane
