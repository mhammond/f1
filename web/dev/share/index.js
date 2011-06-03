/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Raindrop.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * */

/*jslint plusplus: false, indent: 2 */
/*global define: false, location: true, window: false, alert: false,
  document: false, setTimeout: false, localStorage: false */
"use strict";

define([ "require", "jquery", "blade/fn", "rdapi", "oauth", "blade/jig", "blade/url",
         "placeholder", "TextCounter", "dispatch", "accounts",
         "storage", "blade/object",
         "jquery-ui-1.8.6.custom.min", "jquery.textOverflow"],
function (require,   $,        fn,         rdapi,   oauth,   jig,         url,
          placeholder,   TextCounter,   dispatch,   accounts,
          storage,   object) {

  var showStatus,
    hash = location.href.split('#')[1],
    urlArgs, sendData, prop,
    options = {},
    urlSize = 26,
    tabDom, bodyDom, clickBlockDom, timer,
    tabSelection, showNew,
    store = storage();

  // find the list of all link.send app-services
  var shareApps = [];
  navigator.apps.mgmt.list(function(items) {
    for (var key in items) {
      var manifest = items[key].manifest;
      if (!manifest)
        continue;
      if (manifest && manifest.experimental && manifest.experimental.services) {
        for (var index in manifest.experimental.services) {
          var svcinfo = manifest.experimental.services[index];
          if (svcinfo["link.send"]) {
            shareApps.push(items[key]);
          }
        }
      }
    }
  });

  jig.addFn({
    profilePic: function (photos) {
      //TODO: check for a thumbnail picture, hopefully one that is square.
      return photos && photos[0] && photos[0].value || 'i/face2.png';
    },
    serviceName: function (domain) {
      return 'delete me!!';
    }
  });

  function escapeHtml(text) {
    return text ? text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : text;
  }

  function close() {
    dispatch.pub('hide');
  }
  //For debug tab purpose, make it global.
  window.closeShare = close;

  showStatus = function (statusId, shouldCloseOrMessage) {
    $('div.status').addClass('hidden');
    clickBlockDom.removeClass('hidden');
    $('#' + statusId).removeClass('hidden');

    if (shouldCloseOrMessage === true) {
      setTimeout(function () {
        dispatch.pub('success', {
          domain: sendData.domain,
          username: sendData.username,
          userid: sendData.userid
        });
      }, 2000);
    } else if (shouldCloseOrMessage) {
      $('#' + statusId + 'Message').text(shouldCloseOrMessage);
    }
  };

  //Make it globally visible for debug purposes
  window.showStatus = showStatus;

  function cancelStatus() {
    clickBlockDom.addClass('hidden');
    $('div.status').addClass('hidden');
    //Be sure form field placeholders are up to date.
    placeholder();
  }

  function determineTab() {
    var selection;

    if (store.lastSelection) {
      selection = '#' + store.lastSelection;
    } else {
      if (shareApps && shareApps.length) {
        var name = shareApps[0].manifest.name.replace(/ /gi, "");
        selection = '#' + name;
      }
    }
    return selection;
  }

  function updateFirstLastTab() {
    //Apply first and end classes to whatever tabs are shown.
    $('.ui-tabs-nav > li')
      //Reset the tabs
      .removeClass('first')
      .removeClass('last')
      //Only grab non-hidden tabs.
      .filter(function (i) {
        var tab = $(this),
            hidden = tab.hasClass('hidden'),
            debugTab = tab.hasClass('debugTab');
        return !hidden && !debugTab;
      })
      //Apply the new first and last
      .first().addClass('first').end()
      .last().addClass('last');
  }

  if (hash) {
    urlArgs = url.queryToObject(hash);
    if (urlArgs.options) {
      options = JSON.parse(urlArgs.options);
    }
  }
  options.prefs = options.prefs || {};
  if (!options.title) {
    options.title = options.url;
  }
  if (!options.prefs.system) {
    options.prefs.system = 'prod';
  }

  //Save the extension version in the localStorage, for use in
  //other pages like settings.
  if (options.version) {
    store.extensionVersion = options.version;
  }

  //Save the preferences in localStorage, for use in
  //other ppages like setting.
  if (options.prefs) {
    for (prop in options.prefs) {
      if (options.prefs.hasOwnProperty(prop)) {
        store['prefs.' + prop] = options.prefs[prop];
      }
    }
  }

  //For the "new items" link, only show it for x number of days after showing it.
  //NOTE: when updating for newer releases, delete the old value from the
  //storage.
  timer = store.newTimerV2;
  if (!timer) {
    store.newTimerV1 = (new Date()).getTime();
    showNew = true;
  } else {
    timer = JSON.parse(timer);
    //If time since first seen is greater than three days, hide the new link.
    if ((new Date()).getTime() - timer < (3 * 24 * 60 * 60 * 1000)) {
      showNew = true;
    }
  }

  $(function () {
    var thumbImgDom,
      tabSelectionDom, tabhtml = '', panelhtml = '',
      svc, url;

    // first thing, fill in the supported services
    shareApps.forEach(function (app) {
      // clone the manifest object so we can add new stuff for the jig.
      var data = $.extend({}, app);
      data.tabName = data.manifest.name.replace(/ /gi, "");
      data.shareSrc = data.origin + data.manifest.experimental.services[0]['link.send'];
      tabhtml += jig('#tabsTemplate', data);
      panelhtml += jig('#panelsTemplate', data);
    });
    $('.nav .debugTab').before(tabhtml);
    $('#tabs #debug').before(panelhtml);

    thumbImgDom = $('img.thumb');
    bodyDom = $('body');
    clickBlockDom = $('#clickBlock');

    //Set the type of system as a class on the UI to show/hide things in
    //dev vs. production
    if (options.prefs.system) {
      $(document.documentElement).addClass(options.prefs.system);
    }

    //Debug info on the data that was received.
    if (options.prefs.system === 'dev') {
      $('#debugOutput').val(JSON.stringify(options));
      $('#debugCurrentLocation').val(location.href);
    }

    //Show the new link if appropriate.
    if (showNew) {
      $('#newLink').removeClass('hidden');
    }

    //Only bother with localStorage enabled storage.
    if (storage.type === 'memory') {
      showStatus('statusEnableLocalStorage');
      return;
    }

    function init() {
        var hasLastSelectionMatch = false;
        if ((shareApps && shareApps.length)) {
          //Figure out what accounts we do have
          shareApps.forEach(function (app) {
            var name = app.manifest.name;
            if (name && !hasLastSelectionMatch) {
              hasLastSelectionMatch = name === store.lastSelection;
            }
          });
        }
        //If no matching accounts match the last selection clear it.
        if (!hasLastSelectionMatch && !store.accountAdded && store.lastSelection) {
          delete store.lastSelection;
        }
        //Reset the just added state now that accounts have been configured one time.
        if (store.accountAdded) {
          delete store.accountAdded;
        }
        updateFirstLastTab();
        tabSelection = determineTab();

        //Set up HTML so initial jquery UI tabs will not flash away from the selected
        //tab as we show it. Done for performance and to remove a flash of tab content
        //that is not the current tab.
        if (tabSelection) {
          $('.' + tabSelection.slice(1) + 'Tab').addClass('ui-tabs-selected ui-state-active');
          tabSelectionDom = $(tabSelection);
          tabSelectionDom.removeClass('ui-tabs-hide');

          //Set up jQuery UI tabs.
          tabDom = $("#tabs");
          tabDom.tabs({ fx: { opacity: 'toggle', duration: 100 } });
//          tabDom.bind("tabsselect", updateUserTab);
          //Make the tabs visible now to the user, now that tabs have been set up.
          tabDom.removeClass('invisible');
          bodyDom.removeClass('loading');

          //Make sure first/last tab styles are set up accordingly.
          updateFirstLastTab();
        } else {
          showStatus('statusSettings');
        }
    }
    init();
  });
});
