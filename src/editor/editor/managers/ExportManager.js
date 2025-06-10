b3e.editor.ExportManager = function(editor) {
  "use strict";

  function getBlockChildrenIds(block) {
    var conns = block._outConnections.slice(0);
    if (editor._settings.get('layout') === 'horizontal') {
      conns.sort(function(a, b) {
        return a._outBlock.y - 
               b._outBlock.y;
      });
    } else {
      conns.sort(function(a, b) {
        return a._outBlock.x - 
               b._outBlock.x;
      });
    }

    var nodes = [];
    for (var i=0; i<conns.length; i++) {
      nodes.push(conns[i]._outBlock.id);
    }

    return nodes;
  }

  this.projectToData = function() {
    var project = editor.project.get();
    if (!project) return;

    var tree = project.trees.getSelected();

    var data = {
      version      : b3e.VERSION,
      scope        : 'project',
      selectedTree : (tree?tree._id:null),
      trees        : [],
      custom_nodes : this.nodesToData()
    };

    project.trees.each(function(tree) {
      var d = this.treeToData(tree, true);
      d.id = tree._id;
      data.trees.push(d);
    }, this);

    return data;
  };
  
  this.treeToData = function(tree, ignoreNodes) {
    var project = editor.project.get();
    if (!project) return;

    if (!tree) {
      tree = project.trees.getSelected();
    } else {
      tree = project.trees.get(tree);
      if (!tree) return;
    }

    var root = tree.blocks.getRoot();
    var first = getBlockChildrenIds(root);
    var data = {
      version      : b3e.VERSION,
      scope        : 'tree',
      id           : tree._id,
      title        : root.title,
      description  : root.description,
      root         : first[0] || null,
      properties   : root.properties,
      nodes        : {},
      display     : {
        camera_x : tree.x,
        camera_y : tree.y,
        camera_z : tree.scaleX,
        x        : root.x,
        y        : root.y,
      },
    };

    if (!ignoreNodes) {
      data.custom_nodes = this.nodesToData();
    }

    tree.blocks.each(function(block) {
      if (block.category !== 'root') {
        var d ={
          id          : block.id,
          name        : block.name,
          title       : block.title,
          description : block.description,
          properties  : block.properties,
          display     : {x:block.x, y:block.y}
        };

        var children = getBlockChildrenIds(block);
        if (block.category === 'composite') {
          d.children = children;
        } else if (block.category === 'decorator') {
          d.child = children[0];
        }

        data.nodes[block.id] = d;
      }
    });

    return data;
  };

this.treeToBBBTModel = function(tree, ignoreNodes) {
  var project = editor.project.get();
  var superIndex = 0;

  if (!project) return;

  if (!tree) {
    tree = project.trees.getSelected();
  } else {
    tree = project.trees.get(tree);
    if (!tree) return;
  }

  var root = tree.blocks.getRoot();
  var rootChildren = getBlockChildrenIds(root);

  var nodesMap = {};
  tree.blocks.each(function(block) {
    if (block.category !== 'root') {
      var d = {
        id: block.id,
        name: block.name,
        title: block.title,
        description: block.description,
        properties: block.properties || {},
        category: block.category
      };

      var children = getBlockChildrenIds(block);
      if (block.category === 'composite') {
        d.children = children;
      } else if (block.category === 'decorator') {
        d.child = children[0];
      }

      nodesMap[block.id] = d;
    }
  });

  function buildNode(nodeId) {
    const node = nodesMap[nodeId];
    if (!node) return null;

    const result = {};
    result.type = node.name;

    if (node.properties && Object.keys(node.properties).length > 0) {
      result.parameters = { ...node.properties };
    }

    if (node.category === 'composite' && node.children) {
      result.children = {};
      node.children.forEach((childId, index) => {
        var child = buildNode(childId);
        const name = nodesMap[childId].category === 'action' ? nodesMap[childId].title : child.type;
        const childLabel = `${name}.${String.fromCharCode(97 + superIndex)}`;
        result.children[childLabel] = child;

        delete child.type;
      });
    } else if (node.category === 'decorator' && node.child) {
      var child = buildNode(node.child);
      const name = nodesMap[node.child].category === 'action' ? nodesMap[node.child].title : child.type;
      const childLabel = `${name}.${String.fromCharCode(97 + superIndex)}`;

      result.children = {
        [childLabel]: child
      };

      delete child.type;

    } else if (node.category === 'action' || (!node.children && !node.child)) {
      //result.commands = [];
    }

    superIndex++;

    return result;
  }

  const treeRootId = rootChildren[0];
  const nestedTree = buildNode(treeRootId);

  const result = {
    version     : b3e.VERSION,
    scope       : 'tree',
    id          : tree._id,
    title       : root.title,
    description : root.description,
    tree        : nestedTree
  };

  if (!ignoreNodes) {
    result.custom_nodes = this.nodesToData();
  }

  return result.tree;
};

  this.nodesToData = function() {
    var project = editor.project.get();
    if (!project) return;

    var data = [];
    project.nodes.each(function(node) {
      if (!node.isDefault) {
        data.push({
          version     : b3e.VERSION,
          scope       : 'node',
          name        : node.name,
          category    : node.category,
          title       : node.title,
          description : node.description,
          properties  : node.properties,
        });
      }
    });

    return data;
  };

  this.nodesToJavascript = function() {};

  this._applySettings = function(settings) {};
};