const routes = {
  delete: require('../routes/delete'),
  post: require('../routes/post'),
  get: require('../routes/get'),
};

function formatRoutesForConfig(routesMethodAsObject) {
  const methodsAsKeys = Object.keys(routesMethodAsObject);

  return methodsAsKeys.reduce(
    (prev, current) => {
      const oldPrev = [...prev];
      const newRoutesData = routes[current].map((r) => ({ ...r, method: current }));

      oldPrev.push(...newRoutesData);
      return oldPrev;
    },
    [],
  );
};

function generateRoutesConfig(routesConfig) {
  const routesConfigFinally = routesConfig.reduce((prev, current) => {
    if (!prev) {
      return {
        [current.method]: {
          [current.path]: current.data,
        },
      };
    }

    const spreadPrev = { ...prev };
    if (prev[current.method]) {
      spreadPrev[current.method][current.path] = current.data;
      return prev;
    }

    spreadPrev[current.method] = {};
    spreadPrev[current.method][current.path] = current.data;
    return spreadPrev;
  }, null);

  return routesConfigFinally;
}

module.exports = generateRoutesConfig(formatRoutesForConfig(routes));