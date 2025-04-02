import TabInfo from './../controls/tabs/TabInfo';
import QueryType from './QueryType';

class QueryInfo implements TabInfo {
  constructor(
      public title: string,
      public type: QueryType,
      public query: string,
      public id: string,
      public isPinned: boolean,
      public catalog?: string,
      public schema?: string,
  ) {}
}

export default QueryInfo;