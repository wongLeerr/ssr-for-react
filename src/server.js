import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Provider } from 'react-redux';
import createStoreInstance from './store';
import { Helmet } from 'react-helmet';
import Routes, { routesConfig } from './routes';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist/public'));

app.get('*', (req, res) => {
  const store = createStoreInstance();

  const promises = routesConfig?.map((route) => {
    const component = route?.component;

    if (route?.path === req?.url && component?.getInitialData) {
      return component?.getInitialData(store);
    } else {
      return null;
    }
  });

  Promise.all(promises).then(() => {
    const preloadedState = store.getState();
    const content = ReactDOMServer.renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url}>
          <Routes />
        </StaticRouter>
      </Provider>
    );

    const helmet = Helmet.renderStatic();

    const html = `
      <html>
        <head>
          ${helmet?.title?.toString()}
        </head>
        <body>
          <div id="root">${content}</div>
          <script>
          window.__PRELOAD_STATE__=${JSON.stringify(preloadedState)}
          </script>
          <script src="bundle_client.js"></script>
        </body>
      </html>
    `;

    res.writeHead(200, {
      'content-type': 'text/html;charset=utf8',
    });
    res.end(html);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
