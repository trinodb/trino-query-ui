import { useState, useEffect } from 'react';
import QueryApp from './QueryApp';

const defaultQuery = "-- enter your query here\n\nselect * from tpch.sf1.lineitem limit 2";

// for now this is a defacto Tab, but we will treat this tab more as a page in the future
function App() {
  

  return (
      <div className="page">
          <QueryApp />
    </div>
  );
}

export default App;