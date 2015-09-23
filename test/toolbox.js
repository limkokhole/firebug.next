/* See license.txt for terms of usage */

"use strict";

const { Cu } = require("chrome");
const { main, Firebug } = require("../lib/index.js");
const { closeToolbox } = require("dev/utils");
const { getTabWhenReady } = require("./window.js");
const { defer } = require("sdk/core/promise");
const { setInterval, clearInterval } = require("sdk/timers");
const { loadFirebug } = require("./common.js");

const { devtools, gDevTools } = require("firebug.sdk/lib/core/devtools.js");

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

function getToolboxWhenReady(url, panelId = "webconsole", config = {}) {
  let deferred = defer();

  loadFirebug().then(() => {
    getTabWhenReady(url).then(({tab}) => {
      openToolbox(tab, panelId).then(({toolbox}) => {
        let options = {};
        options.panel = toolbox.getCurrentPanel();
        options.overlay = options.panel._firebugPanelOverlay;
        options.tab = tab;
        options.toolbox = toolbox;
        options.chrome = Firebug.getChrome(toolbox);

        deferred.resolve(options);
      });
    });
  });

  return deferred.promise;
}

function waitUntil(checkCb, timeout) {
  let deferred = defer();
  let now = Date.now();

  let intervalId = setInterval(function() {
    if (timeout && Date.now() - now >= timeout) {
      clearInterval(intervalId);
      deferred.reject();
    }

    if (checkCb()) {
      clearInterval(intervalId);
      deferred.resolve();
    }
  }, 250);

  return deferred.promise;
}

// Exports from this module
exports.getToolDefinition = getToolDefinition;
exports.openToolbox = openToolbox;
exports.getToolboxWhenReady = getToolboxWhenReady;
exports.closeToolbox = closeToolbox;
exports.waitUntil = waitUntil;
