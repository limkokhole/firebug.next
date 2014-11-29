/* See license.txt for terms of usage */

"use strict";

const { Cu } = require("chrome");
const { main, Firebug } = require("../lib/index.js");
const { closeTab } = require("sdk/tabs/utils");
const { closeToolbox } = require("dev/utils");
const { getTabWhenReady } = require("./window.js");
const { defer } = require("sdk/core/promise");

const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

function getToolDefinition(toolId) {
  return gDevTools.getToolDefinition(toolId);
}

function openToolbox(tab, panelId) {
  let deferred = defer();

  let target = devtools.TargetFactory.forTab(tab);
  gDevTools.showToolbox(target, panelId).then(toolbox => {
    deferred.resolve({toolbox: toolbox});
  });

  return deferred.promise;
}

function getToolboxWhenReady(url, panelId, config = {}) {
  let deferred = defer();

  getTabWhenReady(url).then(({tab}) => {
    openToolbox(tab, panelId).then(({toolbox}) => {
      let options = {};
      options.panel = toolbox.getCurrentPanel();
      options.overlay = options.panel._firebugPanelOverlay;
      options.tab = tab;
      options.toolbox = toolbox;

      deferred.resolve(options);
    });
  });

  return deferred.promise;
}

// Exports from this module
exports.getToolDefinition = getToolDefinition;
exports.openToolbox = openToolbox;
exports.getToolboxWhenReady = getToolboxWhenReady;
exports.closeTab = closeTab;
exports.closeToolbox = closeToolbox;