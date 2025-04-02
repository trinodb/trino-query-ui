# Trino Query UI

This Trino Query UI is a new UI component that can be integrated into Trino and run directly from the Trino installation at the `/query/` path. For testing, it can also be run separately and can proxy to a Trino running locally or elsewhere.

![Trino Query UI Demo](demos.gif "Trino Query UI Demo")

Implementation details:
* React Typescript project with Vite
* Using Node.js v20+
* Monaco editor + ANTLR parser using Trino language

## Building and Shipping in Trino

The Query UI builds just like the existing UI in Trino.
1. First you build the TypeScript into Javascript and CSS
2. Then copy the distributable path into Trino.
3. Then modify Trino to respond to the query ui path.

### Building for Integration

```
cd precise
npm run build
```

### Copying into Trino

mkdir -p $TRINO_HOME/core/trino-main/src/main/resources/query_ui_webapp/
cp -r dist/* $TRINO_HOME/core/trino-main/src/main/resources/query_ui_webapp/

### Modifying Trino to Respond to /query/

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

### Setup the Coding Environment

Tested on Ubuntu and Windows.

1. Install node.js <https://nodejs.org/en/download/> at least v20
2. Create an NPM enviroment using Vite: `npm create vite@latest`, pick *React*, then *Typescript*
3. In the precise folder, install monaco `npm install @monaco-editor/react`
4. Install Typescript Runtime for ANTLR4 `npm install antlr4ng` and the cli `npm install --save-dev antlr4ng-cli`
   because <https://github.com/tunnelvisionlabs/antlr4ts> seems abandoned?

### Setup Proxying to Local Trino Instance

To run outside of Trino, update the contents of the `vite.config.ts` with the following so that queries can be properly proxied over to Trino's query endpoint running on `http://localhost:8080` or any other proxy path required.

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
});
```

### Build and Run

To run, start:

```shell
  cd precise
  npm install
  npm run dev
```

The local URL will be be displayed which you can open in your browser.

### Building the Parser

To build parser: `npm run antlr4ng`, as configured in **package.json**

## Philosophy

This UI's purpose is to provide an environment where once the cluster is stood up, executing queries and exploring data sets can be done right away. The idended use cases are:
* Initial proof-of-concept queries.
* Exploration of data sets.
* Performance analysis.
* Adhoc query execution.
* Quickly enabling a data engineering team to start work before other integrations are in place.
* Early demos.

The approach taken:
1. Direct integration into Trino UI
   - No need for additional authentication hop (although it could be added in the future)
   - Auth as the user executing the query if using Oauth2
   - Trino does the heavy lifting
2. Don't need to think, just write a query
   - Autocomplete must be aware of not just Trino language but tables and columns
   - Syntax highlighting, validation
   - Comprehensive catalog explorer
3. No black box query execution
   - Show progress and details of execution: people ask "why is my query slow" but mostly this is because they are only shown a spinner for 10 minutes.
   - Link to Trino query UI to drill into query performance
   - Show stages and split counts like Trino console client
4. Easy to navigate

### Gaps and Future Direction

* The ability to save queries and use source control requires either back end capabilities in the Trino service or can utilize Trino to write queries as tables.
* No autocomplete for the Trino function list.
* Basic graphing capabilities - looking at a table is not enough even for inspecting data sets. 
* No LLM copilot integration yet, this is done badly in many query UIs and if done well could make query crafting very fast, and solve other issues like translation from other query languages.
* Parameters and string replace: this is partly implemented in `SubstitutionEditor` and should support both SQL parameters and string replacement.