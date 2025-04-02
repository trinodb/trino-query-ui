import TrinoQueryRunner from "../AsyncTrinoClient";
import Column from "../schema/Column";
import Catalog from "./../schema/Catalog";
import Schema from "./../schema/Schema";
import Table from "./../schema/Table";
import TableReference from "./../schema/TableReference";

class SchemaProvider {

    // error message from last catalog fetch so that it can be displayed to the user
    public static lastSchemaFetchError : string | undefined = undefined;

    static catalogs: Map<string, Catalog> = new Map<string, Catalog>();
    // map of fully qualified table name to tables
    static tables: Map<string, Table> = new Map<string, Table>();

    static getTableNameList(catalogFilter : string | undefined, schemaFilter : string | undefined) : string[] {
        // get list from catalogs, because tables may not be resolved
        const tableNames : string[] = [];
        for (const [key, value] of this.catalogs) {
            if (key === catalogFilter || !catalogFilter) {
                for (const [schemaName, schema] of value.getSchemas()) {
                    if (schemaName === schemaFilter || !schemaFilter) {
                        for (const [tableName, table] of schema.getTables()) {
                            tableNames.push(key + "." + schemaName + "." + tableName);
                        }
                    }
                }
            }
        }
        return tableNames;
    }

    static isTableCached(tableRef : TableReference) {
        if (this.tables.has(tableRef.fullyQualified))
        {
            // check for columns
            const table = this.tables.get(tableRef.fullyQualified);
            if (table && table.getColumns().length > 0) {
                return true;
            }
        }
        return false;
    }

    static getTableWithCache(tableRef : TableReference, callback : any) : Table | undefined {
        if (SchemaProvider.isTableCached(tableRef)) {
            const table : Table | undefined = this.tables.get(tableRef.fullyQualified);
            if (callback) {
                callback(table);
            }
            return table;
        } else {
            SchemaProvider.getTableRefreshCache(tableRef, callback);
            return undefined;
        }
    }

    static getTableIfCached(tableRef : TableReference) {
        if (SchemaProvider.isTableCached(tableRef)) {
            return this.tables.get(tableRef.fullyQualified);
        }
        // async operation to refresh cache but return null in the meantime
        SchemaProvider.getTableRefreshCache(tableRef, (table : Table) => {});
        return null;
    }

    static populateCatalogsAndRefreshTableList(callback : any = null, errorCallback : any = null) {
        // refresh catalogs
        new TrinoQueryRunner().SetAllResultsCallback((results: any[], isError : boolean) => {
            for (let i = 0; i < results.length; i++) {
                const catalog : Catalog = new Catalog(results[i][0], results[i][1]);
                if (!this.catalogs.has(catalog.getName())) {
                    this.catalogs.set(catalog.getName(), catalog);
                }
                this.lastSchemaFetchError = undefined;
                callback();

                // refresh tables and schemas for this catalog
                new TrinoQueryRunner().SetAllResultsCallback((results: any[], isError : boolean) => {
                    for (let i = 0; i < results.length; i++) {
                        const schemaName = results[i][0];
                        const tableName = results[i][1];
                        const tableType = results[i][2];

                        const schema : Schema = catalog.getOrAdd(new Schema(schemaName));
                        const table : Table = new Table(tableName);
                        schema.addTable(table);

                        // add table to tables map
                        this.tables.set(catalog.getName() + "." + schema.getName() + "." + table.getName(), table);
                    }

                    if (!isError) {
                        catalog.clearErrorMessage();
                    }
                    callback();
                })
                .SetErrorMessageCallback((error: string) => {
                    catalog.setErrorMessage(error.toString());
                })
                .StartQuery("SELECT table_schema, table_name, table_type FROM " + catalog.getName() + ".information_schema.tables");
            }
        }).SetErrorMessageCallback((error: string) => {
            this.lastSchemaFetchError = error.toString();
            errorCallback(error.toString());
        }).StartQuery("select catalog_name, connector_name from system.metadata.catalogs");
    }

    /* callback returns a table type */
    static async getTableRefreshCache(tableRef: TableReference, callback: (table: Table) => void) {
        // First try to load all tables in the schema at once
        const query = new TrinoQueryRunner();
        query.SetAllResultsCallback((results: any[]) => {
            // Create a temporary map to hold all tables in this schema
            const schemaTables = new Map<string, Table>();
            
            for (let i = 0; i < results.length; i++) {
                const tableName = results[i][2]; // table_name
                const columnName = results[i][3]; // column_name
                const dataType = results[i][4]; // data_type
                const comment = results[i][5]; // comment
                const extraInfo = results[i][6]; // additional info if available

                let table = schemaTables.get(tableName);
                if (!table) {
                    table = new Table(tableName);
                    schemaTables.set(tableName, table);
                }

                table.getColumns().push(new Column(columnName, dataType, comment || '', extraInfo || ''));
            }

            // Cache all tables we just loaded
            schemaTables.forEach((table, tableName) => {
                const fullPath = `${tableRef.catalogName}.${tableRef.schemaName}.${tableName}`;
                this.tables.set(fullPath, table);

                const catalog = tableRef.getCatalog();
                const schema = tableRef.getSchema();
                if (catalog && schema) {
                    schema.addTable(table);
                }
            });

            // If we found the requested table, use it
            const requestedTable = schemaTables.get(tableRef.tableName);
            if (requestedTable) {
                callback(requestedTable);
            } else {
                // Fall back to DESCRIBE for this specific table
                this.fallbackToDescribe(tableRef, callback);
            }
        })
        .SetErrorMessageCallback((error: string) => {
            console.log('Error fetching table info:', error);
            
            // If information_schema query fails, fall back to DESCRIBE
            this.fallbackToDescribe(tableRef, callback);
        });

        // Query information_schema for all columns in this schema
        query.StartQuery(`
            SELECT 
                table_catalog,
                table_schema,
                table_name,
                column_name,
                data_type,
                comment
            FROM ${tableRef.catalogName}.information_schema.columns 
            WHERE table_schema = '${tableRef.schemaName}'
        `);
    }

    private static fallbackToDescribe(tableRef: TableReference, callback: (table: Table) => void) {
        const fallbackQuery = new TrinoQueryRunner();
        fallbackQuery.SetAllResultsCallback((results: any[]) => {
            const table = new Table(tableRef.tableName);
            const columns = table.getColumns();
            for (let i = 0; i < results.length; i++) {
                columns.push(new Column(results[i][0], results[i][1], results[i][2], results[i][3]));
            }
            this.tables.set(tableRef.fullyQualified, table);
            
            const catalog = tableRef.getCatalog();
            const schema = tableRef.getSchema();
            if (catalog && schema) {
                schema.addTable(table);
            }

            if (callback) {
                callback(table);
            }
        })
        .SetErrorMessageCallback((error: string) => {
            const table = new Table(tableRef.tableName);
            table.setError(error);
            callback(table);
        });

        fallbackQuery.StartQuery(`DESCRIBE ${tableRef.fullyQualified}`);
    }
}

export default SchemaProvider;