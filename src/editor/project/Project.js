(function () {
  "use strict";

  var Project = function(editor) {
    this.Container_constructor();

    // Variables
    this._id = b3.createUUID();
    this._editor = editor;
    this._selectedTree = null;
    this._clipboard = null;
    this._nodes = {};

    // Managers
    this.trees = null;
    this.nodes = null;
    this.history = null;

    this._initialize();
  };
  var p = createjs.extend(Project, createjs.Container);

  p._initialize = function() {
    this.trees = new b3e.project.TreeManager(this._editor, this);
    this.nodes = new b3e.project.NodeManager(this._editor, this);
    this.history = new b3e.project.HistoryManager(this._editor, this);

    var default_nodes = [
      {
        name         : 'root',
        category     : 'root',
        title        : 'My tree',
        description  : 'The root of this tree.  The title of this node sets the title of the tree.  You must have one tree called "Root".  You can set tree-wide properties on this node and reference them in other places with the following template syntax: `{{key_name}}`.' ,
      },
      {
        name         : 'sequence',
        category     : 'composite',
        title        : 'Sequence',
        description  : 'Takes multiple children and runs them from top to bottom (or left to right).  If any fail, this node fails, if all succeed, this node succeeds.',
      },
      {
        name         : 'select',
        category     : 'composite',
        title        : 'Select',
        description  : 'Takes multiple children and runs them from top to bottom (or left to right), succeeding when any one succeeds.  Fails if all fail.',
      },
      {
        name         : 'parallel',
        category     : 'composite',
        title        : 'Parallel',
        description  : '',
      },
      {
        name         : 'repeat_n',
        category     : 'decorator',
        title        : 'Repeat <n>x',
        description  : 'Takes one child and runs it "n" times, where "n" is defined in this node\'s properties.',
        properties   : {n: 2}
      },
      {
        name         : 'untilFalse',
        category     : 'decorator',
        title        : 'Repeat until fail',
        description  : 'Takes one child which it repeats until it fails.  This node always succeeds.',
      },
      {
        name         : 'untilTrue',
        category     : 'decorator',
        title        : 'Repeat until succeed',
        description  : 'Takes one child which it repeats until it succeeds.  This node always succeeds.',
      },
      {
        name         : 'untilTime',
        category     : 'decorator',
        title        : 'Repeat until time',
        description  : '',
        properties   : {min: 1, max: 2}
      },
      {
        name         : 'negate',
        category     : 'decorator',
        title        : 'Negate',
        description  : 'Takes one child.  If that child succeeds, this node fails, and vice versa.',
      },
      {
        name         : 'action',
        category     : 'action',
        title        : 'Action',
        description  : '',
      },
      {
        name         : 'log',
        category     : 'action',
        title        : 'Log',
        description  : 'Logs the specified message.',
      },
    ];

    default_nodes.forEach(function(node_spec) {this.nodes.add(node_spec, true);}, this);

    this._applySettings(this._editor._settings);
    this.history.clear();
    this._editor.clearDirty();
  };

  p._applySettings = function(settings) {
    this.trees._applySettings(settings);
    this.nodes._applySettings(settings);
    this.history._applySettings(settings);
  };

  b3e.project.Project = createjs.promote(Project, 'Container');
})();
