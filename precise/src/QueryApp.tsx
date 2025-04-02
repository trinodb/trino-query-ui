import React from "react";
import QueryCell from "./QueryCell";
import Queries from './schema/Queries';
import CatalogViewer from './controls/catalog_viewer/CatalogViewer';
import './style/layout.css';
import './style/components.css';

interface QueryAppProps {}

interface QueryAppState {
    queries: Queries;
}

class QueryApp extends React.Component<QueryAppProps, QueryAppState> {
    constructor(props: QueryAppProps) {
        super(props);

        this.state = {
            queries: new Queries()
        }
    }

    setQueryContent = (query: string, catalog?: string, schema?: string) => {
        const currentQuery = this.state.queries.getCurrentQuery();
        const updates: any = {};
        
        if (query) {
            updates.query = query;
        }
        
        if (catalog) {
            updates.catalog = catalog;
        }
        
        if (schema) {
            updates.schema = schema;
        }
        
        this.state.queries.updateQuery(currentQuery.id, updates);
    }
    
    appendQueryContent = (query: string, catalog?: string, schema?: string) => {
        const currentQuery = this.state.queries.getCurrentQuery();
        const updates: any = {};
        
        if (query) {
            // Append to existing query, adding newlines as needed
            const existingQuery = currentQuery.query || '';
            const separator = existingQuery.trim() === '' ? '' : '\n\n';
            updates.query = existingQuery + separator + query;
        }
        
        if (catalog) {
            updates.catalog = catalog;
        }
        
        if (schema) {
            updates.schema = schema;
        }
        
        this.state.queries.updateQuery(currentQuery.id, updates);
    }

    render() {
        return (
            <div className="query-editor" key="query-editor">
                <div className="branding-header"></div> 
                <div className="pagegrid" id="pagegrid"> 
                    <div className="catalog" id="catalog-container">
                        <div className="branding-padder"></div>
                        <div className="catalog-wrapper">
                            <CatalogViewer 
                                onGenerateQuery={this.setQueryContent}
                                onAppendQuery={this.appendQueryContent}
                            />
                        </div>
                    </div>

                    <button className="collapse-button" onClick={() => {
                        const pagegrid = document.getElementById('pagegrid');
                        if (pagegrid) {
                            if (pagegrid.style.gridTemplateColumns === '0vw 100vw' || pagegrid.style.gridTemplateColumns === '') {
                                pagegrid.style.gridTemplateColumns = '20vw 80vw';
                                pagegrid.classList.remove('catalog-collapsed');
                                pagegrid.classList.add('catalog-expanded');
                            } else {
                                pagegrid.style.gridTemplateColumns = '0vw 100vw';
                                pagegrid.classList.remove('catalog-expanded');
                                pagegrid.classList.add('catalog-collapsed');
                            }
                        }
                    }}>&#187; Catalogs</button>
                    
                    <div className="cards" id="cards">
                        <div className="branding-padder"></div>
                        <div className="card" key="card">
                            <QueryCell queries={this.state.queries} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default QueryApp;