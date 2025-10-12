# Trino Query UI

A reusable React component for executing queries against Trino. It can be
embedded into any React application and configured to proxy requests to a local
or remote Trino cluster.

> [!WARNING]
> This package is under heavy development and is not yet recommended for
> production workloads. Treat the current release as an early-stage demo;
> production-ready builds and documentation are planned.

![Trino Query UI Demo](demos.gif "Trino Query UI Demo")

Implementation details:
* React TypeScript project with Vite
* Uses Node.js v20+
* Monaco editor + ANTLR parser using the Trino language

## Installation

```
npm install trino-query-ui
```

## Quick start

```tsx
import { QueryEditor } from 'trino-query-ui'
import 'trino-query-ui/dist/index.css'

function MyTrinoApp() {
  return <QueryEditor />
}

export default MyTrinoApp
```

## Building and shipping in Trino

The Query UI builds just like the existing UI in Trino.
1. First you build the TypeScript into Javascript and CSS
2. Then copy the distributable path into Trino.
3. Then modify Trino to respond to the query ui path.

### Building for integration

```
cd precise
npm run build
```

### Copying into Trino

mkdir -p $TRINO_HOME/core/trino-main/src/main/resources/query_ui_webapp/
cp -r dist/* $TRINO_HOME/core/trino-main/src/main/resources/query_ui_webapp/

### Modifying Trino to respond to /query/

Modify `$TRINO_HOME/core/trino-main/src/main/java/io/trino/server/ui/WebUiStaticResource.java`:

Add `/query/` path. Note any path can be used:

```java
    @GET
    @Path("/query")
    public Response getQuery(@BeanParam ExternalUriInfo externalUriInfo)
    {
        return Response.seeOther(externalUriInfo.absolutePath("/query/")).build();
    }
    
    // asset files are always visible
    @ResourceSecurity(PUBLIC)
    @GET
    @Path("/query/assets/{path: .*}")
    public Response getQueryAssetsFile(@PathParam("path") String path)
            throws IOException
    {
        return getQueryFile("assets/" + path);
    }

    @ResourceSecurity(PUBLIC)
    @GET
    @Path("/query/{path: .*}")
    public Response getQueryFile(@PathParam("path") String path)
            throws IOException
    {
        if (path.isEmpty()) {
            path = "index.html";
        }

        String fullPath = "/query_ui_webapp/" + path;
        if (!isCanonical(fullPath)) {
            return Response.status(NOT_FOUND).build();
        }

        URL resource = getClass().getResource(fullPath);
        if (resource == null) {
            return Response.status(NOT_FOUND).build();
        }

        return Response.ok(resource.openStream()).build();
    }

    private static boolean isCanonical(String fullPath)
    {
        try {
            return new URI(fullPath).normalize().getPath().equals(fullPath);
        }
        catch (URISyntaxException e) {
            return false;
        }
    }
```

## Development

### Build and run

1. Install Node.js (v20 or newer) from <https://nodejs.org/en/download/>
2. Install the dependencies and run the dev server:
```
cd precise
npm install
npm run dev
```

The local URL is displayed, and you can open it in your browser.

### Set Up proxying to a local Trino instance

Update `vite.config.ts` with the following so that queries can be
proxied to Trino's query endpoint running on `http://localhost:8080` (or any
other path you require).

```tsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/query/',
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  ...
});
```

### Building the parser

Run `npm run antlr4ng` to build the parser, as configured in **package.json**.

### Linting and code formatting

To check code quality and formatting:

```shell
  npm run check
```

This command runs both ESLint and Prettier, as defined in **package.json**.

## Philosophy

This UI's purpose is to provide an environment where, once the cluster is up,
you can immediately execute queries and explore data sets. The intended use
cases are:
* Initial proof-of-concept queries.
* Exploration of data sets.
* Performance analysis.
* Ad hoc query execution.
* Quickly enabling a data engineering team to start work before other
  integrations are in place.
* Early demos.

The approach:
1. Direct integration into the Trino UI
   - No need for an additional authentication hop (although it could be added
     in the future)
   - Authenticates as the user executing the query when using OAuth2
   - Trino does the heavy lifting
2. Remove friction so you can simply write a query
   - Autocomplete understands the Trino language, tables, and columns
   - Provides syntax highlighting and validation
   - Offers a comprehensive catalog explorer
3. Avoid black-box query execution
   - Show progress and execution details. People ask "why is my query slow?"
     mostly because they only see a spinner for minutes.
   - Link to the Trino Query UI to drill into query performance
   - Show stages and split counts like the Trino console client
4. Keep the experience easy to navigate

### Gaps and future direction

* Saving queries and using source control require either backend capabilities
  in the Trino service or leveraging Trino to write queries as tables.
* No autocomplete for the Trino function list.
* Basic graphing capabilities are still missing—looking at a table alone is
  not enough even for inspecting data sets.
* No LLM copilot integration yet. Many query UIs implement this poorly, but,
  done well, it could make query crafting fast and help translate from other
  query languages.
* Parameters and string replacement are only partly implemented in
  `SubstitutionEditor` and should support both SQL parameters and string
  replacement.
