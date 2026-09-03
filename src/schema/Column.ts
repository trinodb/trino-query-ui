import TrinoQueryRunner from '../AsyncTrinoClient'

class Column {
    private name: string
    private type: string
    private extra: string
    private comment: string
    private sampleValues: string[] = []

    constructor(name: string, type: string, extra: string, comment: string) {
        this.name = name
        this.type = type
        this.extra = extra
        this.comment = comment
        this.sampleValues = []
    }

    getName() {
        return this.name
    }

    getType() {
        return this.type
    }

    getExtra() {
        return this.extra
    }

    getComment() {
        return this.comment
    }

    getExtraOrComment() {
        return this.extra ? this.extra : this.comment
    }

    getSampleValues(TableRef: any, callback: any) {
        // get sample values for this column
        new TrinoQueryRunner()
            .SetAllResultsCallback((results: any[]) => {
                this.sampleValues = []
                for (let i = 0; i < results.length; i++) {
                    this.sampleValues.push(results[i][0])
                }
                callback(this.sampleValues)
            })
            .StartQuery('SELECT ' + this.name + ' FROM ' + TableRef.fullyQualified + ' LIMIT 5')
    }
}

export default Column
