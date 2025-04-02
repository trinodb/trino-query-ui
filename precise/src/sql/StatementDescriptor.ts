class StatementDescriptor {

    tableName : string;
    start: any;
    end: any;

    constructor(tableName : string, start : any, stop : any) {
        this.tableName = tableName;
        this.start = start;
        this.end = stop;
    }
}

export default StatementDescriptor;