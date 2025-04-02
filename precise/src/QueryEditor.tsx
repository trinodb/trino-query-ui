import React from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Queries from './schema/Queries';
import QueryInfo from './schema/QueryInfo';
import EnterpriseTabs from './controls/tabs/EnterpriseTabs';
import * as editor_api from 'monaco-editor/esm/vs/editor/editor.api';
import * as c3 from 'antlr4-c3';
import { CharStream, CommonTokenStream, TerminalNode, ParseTree, ParserRuleContext } from "antlr4ng";
import { SelectSingleContext, ColumnReferenceContext, UnquotedIdentifierContext, TableNameContext } from './generated/lexer/SqlBase.g4/SqlBaseParser';
import { SqlBaseLexer } from './generated/lexer/SqlBase.g4/SqlBaseLexer';
import { SqlBaseParser } from './generated/lexer/SqlBase.g4/SqlBaseParser';
import SqlBaseErrorListener from './sql/SqlBaseErrorListener';
import SqlBaseListenerImpl from './sql/SqlBaseListenerImpl';
import StatementDescriptor from './sql/StatementDescriptor';
import SchemaProvider from './sql/SchemaProvider';
import TableReference from './schema/TableReference';
import Table from './schema/Table';
import Column from './schema/Column';
import NamedQuery from './sql/NamedQuery';
import { tokenMap } from './sql/TokenMap';
import SubstitutionEditor from './SubstitutionEditor';
import './style/query-editor.css';
import { format } from 'sql-formatter';
import { 
    Code,
    Maximize2,
    Minimize2 
  } from 'lucide-react';


const TRINO_SQL_LANGUAGE = 'trinosql';

interface QueryEditorProps {
    queries: Queries;
    onQueryChange: (query: string) => void;
    onSelectChange: (selectedText: string) => void;
    onExecute: () => void;
    catalog?: string;
    schema?: string;
}

interface QueryEditorState {
    currentQuery: QueryInfo | null;
    substitutions: Record<string, string>;
    isMaximized: boolean;
    height: string;
    width: string;
}

// create a private class that extends CompletionItem
// this class will be used to create the completion items
// for the monaco editor
class CompletionItemImpl implements editor_api.languages.CompletionItem {

    label: string;
    kind: editor_api.languages.CompletionItemKind;
    tags?: readonly editor_api.languages.CompletionItemTag[] | undefined;
    detail?: string | undefined;
    sortText?: string | undefined;
    filterText?: string | undefined;
    preselect?: boolean | undefined;
    insertText: string;
    insertTextRules?: editor_api.languages.CompletionItemInsertTextRule | undefined;
    range: editor_api.IRange | editor_api.languages.CompletionItemRanges;
    commitCharacters?: string[] | undefined;
    additionalTextEdits?: editor_api.editor.ISingleEditOperation[] | undefined;
    command?: editor_api.languages.Command | undefined;


    constructor(label: string, kind: editor_api.languages.CompletionItemKind, insertText: string, insertTextRules: editor_api.languages.CompletionItemInsertTextRule, range: editor_api.IRange | editor_api.languages.CompletionItemRanges) {
        this.label = label;
        this.kind = kind;
        this.insertText = insertText;
        this.insertTextRules = insertTextRules;
        this.preselect = false;
        // single line
        this.range = range;
    }
}

class CustomTokenizerState implements monaco.languages.IState {
    clone(): monaco.languages.IState {
        return new CustomTokenizerState();
    }

    equals(other: monaco.languages.IState): boolean {
        return other instanceof CustomTokenizerState;
    }
}

class QueryEditor extends React.Component<QueryEditorProps, QueryEditorState> {

    private editorRef: monaco.editor.IStandaloneCodeEditor | null = null;
    private isRunningParse: boolean = false;
    private updateCounter: number = 0;
    private parseCancelToken: { cancel: boolean } = { cancel: false };
    private lastCompletionItemsPosition: monaco.Position | undefined = undefined;
    private completionItems: monaco.languages.CompletionItem[] = [];

    openModel: any = null;
    decorations: any = null;
    state: QueryEditorState;

    constructor(props: QueryEditorProps) {
        super(props);
        this.state = {
            currentQuery: props.queries.getCurrentQuery(),
            substitutions: {},
            isMaximized: false,
            height: '40vh',
            width: '100%'
        };
    }

    setEditorRef = (editor: monaco.editor.IStandaloneCodeEditor) => {
        this.editorRef = editor;
      };

    componentDidMount() {
        this.props.queries.addChangeListener(this.handleQueriesChange);
    }

    componentWillUnmount() {
        this.props.queries.removeChangeListener(this.handleQueriesChange);
    }

    handleQueriesChange = () => {
        this.setState({
            currentQuery: this.props.queries.getCurrentQuery()
        });
    }

    handleTabChange = (queryId: string) => {
        this.props.queries.setCurrentQuery(queryId);
        if (this.editorRef) {
            const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${queryId}`));
            if (model) {
                this.editorRef.setModel(model);
            }
        }
    };
    
    handleTabSelectAndPromote = (queryId: string) => {
        this.props.queries.moveQueryToFront(queryId);
        this.props.queries.setCurrentQuery(queryId);
    };

    handleTabCreate = () => {
        const newQuery = this.props.queries.addQuery(false, 'New Query');
        monaco.editor.createModel('', TRINO_SQL_LANGUAGE, monaco.Uri.parse(`file:///${newQuery.id}`));
        this.props.queries.setCurrentQuery(newQuery.id);
        return newQuery.id;
    };

    handleTabClose = (id: string) => {
        this.props.queries.deleteQuery(id);
        const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${id}`));
        if (model) {
            model.dispose();
        }
    };

    handleTabRename = (id: string, newTitle: string) => {
        this.props.queries.updateQuery(id, { title: newTitle });
    };

    handleEditorChange = (newQuery: string | undefined) => {
        if (newQuery !== undefined && this.state.currentQuery) {
            this.props.queries.updateQuery(this.state.currentQuery.id, { query: newQuery });
            this.props.onQueryChange(newQuery);
        }
    };

    handleSubstitutionChange = (newSubstitutions: Record<string, string>) => {
        this.setState({ substitutions: newSubstitutions });
    }

    toggleMaximize = () => {
        this.setState(prevState => ({
            isMaximized: !prevState.isMaximized,
            // 2.5 em for the tab bar, 3em for the substitution editor, 3em for the brand bar
            height: !prevState.isMaximized ? 'calc(100vh - 2.5em - 3em - 3.5em)' : '40vh',
            width: '100%'
        }));
    };


    // method to get contents of react editor
    getContent() {
        return this.openModel.getValue();
    }

    async parseAndDecoratePromiseAsync(monaco: any, editor: any, waitForUserToStopTyping: number): Promise<boolean> {
        if (this.isRunningParse) {
            //console.error("cancelled parsing:" + this.isRunningParse);
            return false;
        }

        this.isRunningParse = true;
        this.parseCancelToken.cancel = false;

        try {
            let lastUpdateCounter = 0;

            // Wait for the user to stop typing before parsing
            do {
                await new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        this.parseCancelToken.cancel ? reject(new Error("Parsing cancelled")) : resolve();
                    }, waitForUserToStopTyping);
                });
                lastUpdateCounter = this.updateCounter;
            } while (lastUpdateCounter !== this.updateCounter);

            if (this.parseCancelToken.cancel) {
                //console.error("cancelled parsing");
                return false;
            }

            // Call sync method
            return this.parseAndDecoratePromise(monaco, editor, lastUpdateCounter);
        } catch (error) {
            //console.error(error);
            return false;
        } finally {
            this.isRunningParse = false;
            //console.error("end parsing:" + this.isRunningParse);
        }
    }

    // Takes the editor and parses the text, then decorates the editor with errors, autocomplete, and special syntax highlighting
    parseAndDecoratePromise(monaco: any, editor: any, lastUpdateCounter: number): boolean {

        var newValue: string = editor.getValue()
        const lines: string[] = newValue.split("\n");
        const caretPosition: editor_api.Position = editor.getPosition();

        // Gather information about the cursor position
        let currentWord = "";
        let currentLine: string = lines[caretPosition.lineNumber - 1];
        // note: column is 1 indexed, so current position is - 1, previous character is - 2
        let isCursorSurroundedBySpaces = currentLine[caretPosition.column - 2] == " " && (currentLine[caretPosition.column - 1] == " " || caretPosition.column == currentLine.length + 1);
        let startWordColumn = caretPosition.column;
        let endWord = caretPosition.column - 1;
        // get characters before the current word
        // The cursor position after typing a word is at the end of the word, like this: `word|`
        // So: - start -1 to get the last character of the word to the left
        //     - then -1 because the column is 1 indexed 
        for (let i = caretPosition.column - 1; i >= 1; i--) {
            if (currentLine[i - 1] == " " || currentLine[i - 1] == ",") {
                break;
            }
            currentWord = currentLine[i - 1] + currentWord;
            startWordColumn = i;
        }

        // get characters after the current word
        for (let i = caretPosition.column; i < currentLine.length; i++) {
            if (currentLine[i - 1] == " " || currentLine[i - 1] == ",") {
                break;
            }
            currentWord += currentLine[i - 1];
            endWord = i;
        }

        // In parseAndDecoratePromise, after calculating currentWord:
        console.log("Current word being parsed:", currentWord);
        console.log("Cursor position:", caretPosition.lineNumber, caretPosition.column);
        console.log("Word bounds:", startWordColumn, "to", endWord);

        const inputStream = CharStream.fromString(newValue);
        const lexer = new SqlBaseLexer(inputStream);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new SqlBaseParser(tokenStream);
        
        // Pass the current catalog and schema to the listener
        const listener = new SqlBaseListenerImpl(this.props.catalog, this.props.schema);
        
        parser.addParseListener(listener);
        // Remove default error listeners for SQL and add our custom one
        parser.removeErrorListeners();
        var errors: SqlBaseErrorListener = new SqlBaseErrorListener()
        parser.addErrorListener(errors);
        // Build a parsed structure for a single statement
        const tree = parser.singleStatement();
        
        var currentTreePosition: any = undefined;
        var currentTreeIndex: number = 0;

        var statements = listener.statements;
        var namedQueries = listener.namedQueries;
        currentTreePosition = this.parseTreeFromPosition(tree, caretPosition.column, caretPosition.lineNumber);
        if (statements.length == 0 && currentTreePosition == undefined) {
            // reconstruct input inserting an underscore at the cursor position
            const phantomKeyword: string = "i";
            const newLine = currentLine.substring(0, caretPosition.column - 1) + phantomKeyword + currentLine.substring(caretPosition.column - 1);
            const newText = lines.slice(0, caretPosition.lineNumber - 1).join("\n") + newLine + (lines.length > caretPosition.lineNumber ? "\n" + lines.slice(caretPosition.lineNumber).join("\n") : "");

            const inputStreamWithChar = CharStream.fromString(newText);
            const lexerWithChar = new SqlBaseLexer(inputStreamWithChar);
            const tokenStreamWithChar = new CommonTokenStream(lexerWithChar);
            const parserWithChar = new SqlBaseParser(tokenStreamWithChar);
            const listenerWithChar = new SqlBaseListenerImpl(this.props.catalog, this.props.schema);
            parserWithChar.addParseListener(listenerWithChar);
            const treeWithChar = parserWithChar.singleStatement();
            currentTreePosition = this.parseTreeFromPosition(treeWithChar, caretPosition.column - 1, caretPosition.lineNumber, "");
            statements = listenerWithChar.statements;
            namedQueries = listenerWithChar.namedQueries;
            //console.log("created phantom");
        }
        else {
            // symbol covering caret position
            currentTreePosition = this.parseTreeFromPosition(tree, caretPosition.column, caretPosition.lineNumber);
        }

        if (currentTreePosition != undefined && currentTreePosition.symbol != undefined) {
            currentTreeIndex = currentTreePosition.symbol.tokenIndex;
            //console.log("found symbol at " + currentTreePosition.symbol.tokenIndex);
        }
        else {
            currentTreeIndex = currentTreePosition.ruleIndex;
        }

        const markers = errors.getMarkers();
        monaco.editor.setModelMarkers(editor.getModel(), "owner", markers);

        // Add decorations for table names
        editor.removeDecorationsCollection
        if (this.decorations) {
            this.decorations.clear();
        }
        this.decorations = editor.createDecorationsCollection(listener.getDecorations())

        // Autocomplete handling happend after the parse
        // Verify no typing
        if (this.updateCounter != lastUpdateCounter) {
            return false;
        }

        let core = new c3.CodeCompletionCore(parser);
        core.showDebugOutput = false; // logging debug info from parser

        // create a set of rules that should be used for code completion
        let ruleSet = new Set<number>([SqlBaseParser.RULE_selectItem]);
        core.preferredRules = ruleSet;

        let candidates = core.collectCandidates(currentTreeIndex);

        this.generateLexerAutocompleteCandidates(lines, parser, startWordColumn, endWord, caretPosition, monaco, editor, core, candidates, currentTreePosition, statements, namedQueries);

        this.isRunningParse = false;
        return true;
    };

    checkForParentOfContext(currentTreePosition: any, parentType: any): boolean {
        var current: any = currentTreePosition;
        while (current) {
            if (current instanceof parentType) {
                return true;
            }
            current = current.parent;
        }

        return false;
    }

    createCompletionItem(match: string, replace: string, caretPosition: editor_api.Position, startWordColumn: number, endWordColumn: number) {
        return {
            label: match,
            kind: editor_api.languages.CompletionItemKind.Keyword,
            insertText: replace,
            insertTextRules: editor_api.languages.CompletionItemInsertTextRule.None,
            // Use Monaco's preferred format for ranges
            range: {
                startLineNumber: caretPosition.lineNumber,
                startColumn: startWordColumn,
                endLineNumber: caretPosition.lineNumber,
                endColumn: Math.max(startWordColumn, caretPosition.column) // Use at least the cursor position
            }
        };
    }

    generateLexerAutocompleteCandidates(lines: string[], parser: SqlBaseParser, startWordColumn: number, endWord: number, caretPosition: editor_api.Position, monaco: any, editor: any, core: any, candidates: any, currentTreePosition: any, statements: StatementDescriptor[], namedQueries: Map<string, NamedQuery>) {


        // At the beginning:
        // console.log("Generating autocomplete candidates");
        // console.log("Word bounds passed:", startWordColumn, "to", endWord);
        const endWordLineOffset: number = endWord + 1;

        let keywords: string[] = [];
        let completionItems: CompletionItemImpl[] = [];
        for (let candidate of candidates.tokens) {
            //var tokenType = parser.getTokenType(candidate[0]);
            let displayName = parser.vocabulary.getSymbolicName(candidate[0]);

            if (candidate[1].length > 0) {
                for (let candidateId of candidate[1]) {
                    displayName += " " + parser.vocabulary.getSymbolicName(candidateId);
                }
            }

            if (displayName) {

                completionItems.push(this.createCompletionItem(displayName.toLowerCase(), displayName.toLowerCase() + " ", caretPosition, startWordColumn, startWordColumn + displayName.length));
                if (displayName.toLowerCase() == "select") {
                    completionItems.push(this.createCompletionItem("select * from", "select * from ", caretPosition, startWordColumn, endWordLineOffset));
                }
                if (displayName.toLowerCase() == "limit") {
                    completionItems.push(this.createCompletionItem("limit 5", "limit 5", caretPosition, startWordColumn, endWordLineOffset));
                }
                if (displayName.toLowerCase() == "with") {
                    completionItems.push(this.createCompletionItem("with query as (select * from )", "with query as (select * from )", caretPosition, startWordColumn, endWordLineOffset));
                }
            }
        }

        //console.log("Keyword completion items:", completionItems.length);
        
        // check if parent is the parser's TableNameContext 
        if (this.checkForParentOfContext(currentTreePosition, TableNameContext)) {
            // loop through all tables in the catalog
            const tableNames: string[] = SchemaProvider.getTableNameList(undefined, undefined);
            for (let tableName of tableNames) {
                completionItems.push(
                    new CompletionItemImpl
                        (tableName,
                            editor_api.languages.CompletionItemKind.Reference,
                            tableName,
                            monaco.languages.CompletionItemInsertTextRule.None,
                            { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset }
                        ));
            }

            // add named queries 
            for (let [key, value] of namedQueries) {
                completionItems.push(
                    new CompletionItemImpl
                        (key,
                            editor_api.languages.CompletionItemKind.Reference,
                            key,
                            monaco.languages.CompletionItemInsertTextRule.None,
                            { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset }
                        ));
            }
        }

        
        //console.log("After table names, completion items:", completionItems.length);

        for (let statement of statements) {
            // log location of caret vs statement position
            console.log("caret: " + caretPosition.column + " " + caretPosition.lineNumber);
            console.log("statement start: " + statement.start.column + " " + statement.start.line);
            console.log("statement end: " + statement.end.column + " " + statement.end.line);

            // if inside ColumnReferenceContext, we can use the table name to get the columns
            if ((caretPosition.column >= statement.start.column && statement.start.line == caretPosition.lineNumber) ||
                (caretPosition.column <= statement.end.column && statement.end.line == caretPosition.lineNumber) ||
                (caretPosition.lineNumber > statement.start.line && caretPosition.lineNumber < statement.end.line)) {
                console.log("Found statement");

                const tableName: string = statement.tableName;
                let tableReference: TableReference | undefined;
                if (TableReference.isFullyQualified(tableName)) {
                    tableReference = TableReference.fromFullyQualified(tableName);
                } else if (this.props.catalog && this.props.schema) {
                    // Use current catalog and schema from props
                    tableReference = new TableReference(
                        this.props.catalog,
                        this.props.schema,
                        tableName
                    );
                }

                if (tableReference) {
                    SchemaProvider.getTableWithCache(tableReference, (table: Table) => {
                        for (let column of table.getColumns()) {
                            completionItems.push(
                                new CompletionItemImpl
                                    (column.getName(),
                                        editor_api.languages.CompletionItemKind.Field,
                                        column.getName(),
                                        monaco.languages.CompletionItemInsertTextRule.None,
                                        {
                                            insert: { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset },
                                            replace: { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset }
                                        }
                                    ));
                        }

                        const singleListOfColumnsJoinedByCommas: string = "\n    " + table.getColumns().map((column: Column) => column.getName()).join("\n   ,");

                        completionItems.push(
                            new CompletionItemImpl
                                (singleListOfColumnsJoinedByCommas,
                                    editor_api.languages.CompletionItemKind.Field,
                                    singleListOfColumnsJoinedByCommas + " ",
                                    monaco.languages.CompletionItemInsertTextRule.None,
                                    {
                                        insert: { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset },
                                        replace: { startLineNumber: caretPosition.lineNumber, startColumn: startWordColumn, endLineNumber: caretPosition.lineNumber, endColumn: endWordLineOffset }
                                    }
                                ));
                    });
                }
            }
        }



        let selectNames: string[] = [];
        for (let candidate of candidates.rules) {
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
            this.completionItems = completionItems;
            this.lastCompletionItemsPosition = caretPosition;
        }

        // At the very end of the method:
        console.log("Final completion items:", completionItems.length);
    }

    cancelParsing() {
        //console.error("CANCEL");
        this.parseCancelToken.cancel = true;
        this.isRunningParse = false;
    }

    editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
        this.setEditorRef(editor);

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.props.onExecute();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            // execute the query on ctrl+enter
            this.props.onExecute();
        });

        editor.addAction({
            id: 'format-sql',
            label: 'Format SQL',
            keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
            contextMenuGroupId: 'modification',
            contextMenuOrder: 1.5,
            run: () => {
              this.formatSql();
            }
          });
          

        // Check if the provider is already registered
        if (!monaco.languages.getLanguages().some((lang: any) => lang.id === TRINO_SQL_LANGUAGE)) {
            monaco.languages.register({ id:TRINO_SQL_LANGUAGE });

            monaco.languages.setTokensProvider(TRINO_SQL_LANGUAGE, {
                getInitialState: () => new CustomTokenizerState(),
                tokenize: (line: any, state: any) => {
                    const inputStream = CharStream.fromString(line);
                    const lexer = new SqlBaseLexer(inputStream);
                    const tokenStream = new CommonTokenStream(lexer);
                    lexer.reset();

                    const tokens = [];
                    let token = lexer.nextToken();
                    while (token.type !== SqlBaseLexer.EOF) {
                        tokens.push({
                            startIndex: token.start,
                            scopes: tokenMap[token.type as keyof typeof tokenMap] || 'identifier',
                        });
                        token = lexer.nextToken();
                    }

                    return { tokens, endState: state };
                },
            });

            monaco.languages.registerCompletionItemProvider(TRINO_SQL_LANGUAGE, {
                provideCompletionItems: async (model: any, position: any) => {
                    this.cancelParsing(); // Cancel any ongoing parsing
                    const parseResult = await this.parseAndDecoratePromiseAsync(monaco, editor, 0);
                    if (this.lastCompletionItemsPosition && this.lastCompletionItemsPosition.lineNumber == position.lineNumber && this.lastCompletionItemsPosition.column == position.column) {
                        return { suggestions: this.completionItems };
                    } else {
                        return { suggestions: [] }; // either parsing failed or the position is not the same as the last parse
                    }
                }
            });
        }

        editor.onDidChangeModelContent(async (e: any) => {
            this.updateCounter++;
            this.handleEditorChange(editor.getValue());
            await this.parseAndDecoratePromiseAsync(monaco, editor, 200).then((result) => {
                //console.log("done parsing");
            });
        });

        editor.onDidChangeCursorSelection(() => {
            const selection = editor.getSelection();
            if (selection == null) {
                return;
            }
            if (selection.startLineNumber != selection.endLineNumber || selection.startColumn != selection.endColumn) {
                const model = editor.getModel();
                if (model) {
                    const selectedText = model.getValueInRange(selection);
                    this.props.onSelectChange(selectedText);
                }
            }
            else {
                this.props.onSelectChange(editor.getValue());
            }
        });

        // init the parser once to get the initial state
        this.parseAndDecoratePromiseAsync(monaco, editor, 0).then((result) => {
            //console.log("done parsing");
        });

    }

    parseTreeFromPosition(root: ParseTree, cursorColumnOffsetZero: number, row: number, phantomKeyword: string = ""): any | undefined {
        // Does the root node actually contain the position? If not, we don't need to look further.
        if (root instanceof TerminalNode) {
            let terminal = root as TerminalNode;
            let token = terminal.symbol;
            if (token.line != row) return undefined;
            //let tokenStop = token.column + (token.stop - token.start + 1);
            if (cursorColumnOffsetZero >= token.column && token.text !== phantomKeyword && token.text !== "<EOF>") {
                // all we care about is whether it's the last token after this one starts
                return terminal;
            }
            return undefined;
        } else {
            var context = root as ParserRuleContext;
            if (!context.start || !context.stop) {
                // Invalid tree?
                return undefined;
            }

            var result = undefined
            if (context.children) {
                let lastresult = undefined
                for (let child of context.children) {
                    result = this.parseTreeFromPosition(child, cursorColumnOffsetZero, row, phantomKeyword);
                    if (result == undefined && lastresult != undefined) {
                        return lastresult;
                    }
                    lastresult = result;
                }
                if (result != undefined) {
                    return result;
                }
            }

            if (context.children && context.children.length > 1 && context.children[0].getText() !== phantomKeyword && context.children[0].getText() !== "<EOF>") {
                return context.children[0];
            }
            else {
                return undefined;
            }
        }
    }

    // Format the entire SQL query
    formatSql = () => {
        if (this.editorRef) {
        const currentValue = this.editorRef.getValue();
        
        try {
            const config = {
                indent: '  ',
                uppercase: true,
                linesBetweenQueries: 2
            };
            const formattedSql = format(currentValue, config);
            
            // Replace the entire editor content with the formatted SQL
            this.editorRef.setValue(formattedSql);
            
            // Trigger a save to update the query in state
            this.handleEditorChange(formattedSql);
        } catch (error) {
            console.error('Error formatting SQL:', error);
        }
        }
    };
    
    // Format only the selected text
    formatSelection = () => {
        if (this.editorRef) {
        const selection = this.editorRef.getSelection();
        if (!selection || selection.isEmpty()) {
            // No selection, format the entire query
            this.formatSql();
            return;
        }
        
        const model = this.editorRef.getModel();
        if (model) {
            const selectedText = model.getValueInRange(selection);
            try {
            // Format just the selected text
            const config = {
                indent: '  ',
                uppercase: true,
                linesBetweenQueries: 2
            };
            const formattedSql = format(selectedText, config);
            
            // Replace just the selected part
            this.editorRef.executeEdits('format-selection', [{
                range: selection,
                text: formattedSql,
                forceMoveMarkers: true
            }]);
            } catch (error) {
            console.error('Error formatting selection:', error);
            }
        }
        }
    };

    handleHeightChange = (newHeight: string) => {
        this.setState({ height: newHeight });
    }

    render() {
        const options = {
            selectOnLineNumbers: true
        };

        const { currentQuery, isMaximized, height, width } = this.state;

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
                <div style={{ position: 'relative', width: '100%' }}>
                        <div style={{ position: 'relative' }}>
                        <div className="editor-toolbar">
                            <button
                            className="editor-button"
                            onClick={this.formatSql}
                            disabled={false}
                            data-tooltip="Format SQL (Alt+Shift+F)"
                            >
                            <Code size={18} strokeWidth={1.5} />
                            </button>
                            <button
                            className="editor-button"
                            onClick={this.toggleMaximize}
                            data-tooltip={isMaximized ? "Minimize" : "Maximize"}
                            >
                            {isMaximized ? 
                                <Minimize2 size={18} strokeWidth={1.5} /> : 
                                <Maximize2 size={18} strokeWidth={1.5} />
                            }
                            </button>
                        </div>
                        <Editor
                            height={height}
                            width={width}
                            language="trinosql"
                            theme="vs-dark"
                            value={currentQuery?.query || ''}
                            options={{
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
                        </div>
                    </div>
                    </>
            );
    }   
}

export default QueryEditor;