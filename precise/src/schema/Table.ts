import Column from './Column';

class Table {
    private name: string;
    private columns: Column[] = [];
    private error: string = "";
    private isLoadingColumns: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getColumns() {
        return this.columns;
    }

    getError() {
        return this.error;
    }

    isLoading() {
        return this.isLoadingColumns;
    }

    setLoading(loading: boolean) {
        this.isLoadingColumns = loading;
    }

    hasLoadedColumns() {
        return this.columns.length > 0 || this.error !== "";
    }

    getColumnsForSelect() {
        return this.columns.map(column => column.getName()).join(", ");
    }

    getFullSchemaAsString() {
        var fullSchema = "";
        this.columns.forEach(column => {
            fullSchema += column.getName() + " " + column.getType() + "<br />";
        });
        return fullSchema;
    }

    setError(error: string) {
        this.error = error;
        this.isLoadingColumns = false;
    }
}

export default Table;