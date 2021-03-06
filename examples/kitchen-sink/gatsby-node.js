const path = require("path");

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMdx {
              edges {
                node {
                  id
                  tableOfContents
                  parent {
                    ... on File {
                      absolutePath
                      name
                      sourceInstanceName
                    }
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors); // eslint-disable-line no-console
          reject(result.errors);
        }

        // Create blog posts pages.
        result.data.allMdx.edges.forEach(({ node }) => {
          createPage({
            path: `/${node.parent.sourceInstanceName}/${node.parent.name}`,
            component: path.resolve("./src/components/mdx-runtime-test.js"),
            context: {
              absPath: node.parent.absolutePath,
              tableOfContents: node.tableOfContents,
              id: node.id
            }
          });
        });

        // manually create a page with a lot of mdx
        createPage({
          path: `/generated/multi-mdx`,
          component: path.resolve("./src/components/mdx-runtime-multi-test.js"),
          context: {}
        });
      })
    );
  });
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"]
    }
  });
};

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    const parent = getNode(node.parent);
    createNodeField({
      node,
      name: `slug`,
      value: `/${parent.sourceInstanceName}/${parent.name}`
    });
  }
};
