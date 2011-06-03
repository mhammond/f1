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

/*jslint plusplus: false, indent: 2, nomen: false */
/*global require: false, define: false, location: true, window: false, alert: false,
  document: false, setTimeout: false, localStorage: false */
"use strict";

require({
  paths: {
    widgets: '../share/panel/scripts/widgets'
  }
});

define([ "require", "jquery", "blade/object", "blade/fn", "rdapi", "oauth",
        "blade/jig", "blade/url", "placeholder", "AutoComplete", "dispatch", "accounts",
         "storage", "services", "shareOptions", "widgets/PageInfo",
         "widgets/DebugPanel", "widgets/AccountPanel", "dotCompare",
         "jschannel",
         "jquery-ui-1.8.7.min", "jquery.textOverflow"],
function (require,   $,        object,         fn,         rdapi,   oauth,
          jig,         url,        placeholder,   AutoComplete,   dispatch,   accounts,
          storage,   services,   shareOptions,   PageInfo,
          DebugPanel,           AccountPanel,           dotCompare) {

  var actions = services.domains,
    options = shareOptions(),
    bodyDom, timer, pageInfo, sendData, showNew,
    accountPanels = [],
    store = storage(),
    SHARE_DONE = 0,
    SHARE_START = 1,
    SHARE_ERROR = 2,
    okStatusIds = {
      statusSettings: true,
      statusSharing: true,
      statusShared: true
    },
    isGreaterThan076 = dotCompare(store.extensionVersion, "0.7.7") > -1;

  // find the list of all link.send app-services
  var shareApps = [],
      shareChannels = [];

/***
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
***/
  function hide() {
    dispatch.pub('hide');
  }
  window.hideShare = hide;

  function close() {
    dispatch.pub('close');
  }
  //For debug tab purpose, make it global.
  window.closeShare = close;

  function createChannels()
  {
    // XX we shouldn't be creating all the channels at once
    for (var i=0;i<shareApps.length;i++)
    {
      var svc = shareApps[i];
      try {
        var anIframe = document.getElementById("svc-frame-" + i);
        
        var chan = Channel.build({
            window: anIframe.contentWindow,
            origin: svc.url,
            scope: "openwebapps_conduit"
        });

        chan.call({
            method: "link.send",
            params: options,
            success: function() {}, /* perhaps record the fact that it worked? */
            error: (function() {return function(error, message) {
              var messageData = {cmd:"error", error:error, msg:message};
              var msg = document.createEvent("MessageEvent");
              msg.initMessageEvent("message", // type
                                   true, true, // bubble, cancelable
                                   JSON.stringify(messageData),  // data
                                   "resource://openwebapps/service", "", window); // origin, source
              document.dispatchEvent(msg);
              
            }}())
        });    
        shareChannels.push(chan);
      } catch (e) {
        dump("Warning: unable to create channel to " + svc.url + ": " + e + "\n");
      }
    }
  }

  function confirm()
  {
    var selected = $("#account-accordion").accordion('option', 'active'); // => 0
    shareChannels[selected].call({
      method: "confirm",
      success: function(result) {
        var messageData = {app:shareApps[selected].app, cmd:"result", result:result};
        var msg = document.createEvent("MessageEvent");
        msg.initMessageEvent("message", // type
                             true, true, // bubble, cancelable
                             JSON.stringify(messageData),  // data
                             "resource://openwebapps/service", "", window); // origin, source
        document.dispatchEvent(msg);
      }
    });
  }
  $("#confirmbutton").click(confirm);

  function updateChromeStatus(status, statusId, message) {
    dispatch.pub('updateStatus', [status, statusId, message, options.url]);
  }
  window.updateChromeStatus = updateChromeStatus;

  function _showStatus(statusId, shouldCloseOrMessage) {
    if (shouldCloseOrMessage === true) {
      setTimeout(function () {
        dispatch.pub('success', {
          domain: sendData.domain,
          username: sendData.username,
          userid: sendData.userid,
          url: options.url,
          service: services.domains[sendData.domain].name
        });
        $('div.status').addClass('hidden');
      }, 2000);
    } else if (shouldCloseOrMessage) {
      $('#' + statusId + 'Message').text(shouldCloseOrMessage);
    }

    //Tell the extension that the size of the content may have changed.
    dispatch.pub('sizeToContent');
  }

  function showStatus(statusId, shouldCloseOrMessage) {
    $('div.status').addClass('hidden');
    $('#clickBlock').removeClass('hidden');
    $('#' + statusId).removeClass('hidden');

    if (!okStatusIds[statusId]) {
      updateChromeStatus(SHARE_ERROR, statusId, shouldCloseOrMessage);
    }
    _showStatus(statusId, shouldCloseOrMessage);
  }
  //Make it globally visible for debug purposes
  window.showStatus = showStatus;

  function resetStatusDisplay() {
    $('#clickBlock').addClass('hidden');
    $('div.status').addClass('hidden');
    //Be sure form field placeholders are up to date.
    placeholder();
  }

  function cancelStatus() {
    // clear any existing status
    updateChromeStatus(SHARE_DONE);
    resetStatusDisplay();
  }

  function shareStateUpdate(shareState) {
    var status = null;
    if (shareState && shareState.status) {
      // remove the status number
      status = shareState.status.slice(1);
    }
    if (status && status[0]) {
      _showStatus.apply(null, status);
    } else {
      //clear all status, but if settings config needs to be shown, show it.
      cancelStatus();
      accounts(
        function (accts) {
          if (!accts || !accts.length) {
            showStatus('statusSettings');
          }
        }, function (err) {
          showStatus('statusSettings');
        }
      );
    }
    // we could switch to handling options this way:
    //dispatch.pub('optionsChanged', shareState.options);
  }
  dispatch.sub('shareState', shareStateUpdate);

  function showStatusShared() {
    // if no sendData, we're in debug mode, default to twitter to show the
    // panel for debugging
    var sendDomain = (sendData && sendData.domain) || 'twitter.com',
        siteName = options.siteName,
        url = options.url || "",
        doubleSlashIndex = url.indexOf("//") + 2;
    $('#statusShared').empty().append(jig('#sharedTemplate', {
      domain: siteName || url.slice(doubleSlashIndex, url.indexOf("/", doubleSlashIndex)),
      service: actions[sendDomain].name,
      href: actions[sendDomain].serviceUrl
    })).find('.shareTitle').textOverflow(null, true);
    showStatus('statusShared', true);
  }
  //Make it globally visible for debug purposes
  window.showStatusShared = showStatusShared;

  function handleCaptcha(detail, error) {
    $('#captchaImage').attr('src', detail.imageurl);
    if (error) {
      $('#captchaMsg').text(error.message);
    }
    $('#captchaSound').attr('src', detail.audiourl);
    showStatus('statusCaptcha', false);
  }
  window.handleCaptcha = handleCaptcha;

  function reAuth() {
    //Save form state so their message can be recovered after
    //binding accounts.
    accountPanels.forEach(function (panel) {
      panel.saveData();
    });
    showStatus('statusAuth');
  }

  function checkBase64Preview() {
    //Ask extension to generate base64 data if none available.
    //Useful for sending previews in email.
    var preview = options.previews && options.previews[0];
    if (accounts.length && preview && preview.http_url && !preview.base64) {
      dispatch.pub('generateBase64Preview', preview.http_url);
    }
  }

  // This method assumes the sendData object has already been set up.
  // You probably want sendMessage, not this call.
  function callSendApi() {
    rdapi('send', {
      type: 'POST',
      domain: sendData.domain,
      data: sendData,
      success: function (json) {
        // {'message': u'Status is a duplicate.', 'provider': u'twitter.com'}
        if (json.error && json.error.status) {
          var code = json.error.status;
          // XXX need to find out what error codes everyone uses
          // oauth+smtp will return a 535 on authentication failure
          if (code ===  401 || code === 535) {
            reAuth();
          } else if (json.error.code === 'Client.HumanVerificationRequired') {
            handleCaptcha(json.error.detail);
          } else if (json.error.code === 'Client.WrongInput') {
            handleCaptcha(json.error.detail, json.error);
          } else {
            showStatus('statusError', json.error.message);
          }
        } else if (json.error) {
          showStatus('statusError', json.error.message);
        } else {
          store.lastSelection = actions[sendData.domain].type;
          showStatusShared();
          //Be sure to delete sessionRestore data
          accountPanels.forEach(function (panel) {
            panel.clearSavedData();
          });

          // notify on successful send for components that want to do
          // work, like save any new contacts.
          dispatch.pub('sendComplete', sendData);
        }
      },
      error: function (xhr, textStatus, err) {
        if (xhr.status === 403) {
          //header error will be "CSRF" if missing CSRF token. This usually
          //means we lost all our cookies, or the server lost our session.
          //We could get more granular, to try to distinguish CSRF missing
          //token from just missing other cookine info, but in practice,
          //it is hard to see how that might happen -- either all the cookies
          //are gone or they are all there.
          //var headerError = xhr.getResponseHeader('X-Error');
          reAuth();
        } else if (xhr.status === 503) {
          dispatch.pub('serverErrorPossibleRetry', {
            xhr: xhr
          });
        } else if (xhr.status === 0) {
          showStatus('statusServerError');
        } else {
          showStatus('statusError', err);
        }
      }
    });
  }

  function sendMessage(data) {
    showStatus('statusSharing');

    sendData = data;

    var svcData = accounts.getService(data.domain, data.userid, data.username),
        svcConfig = services.domains[data.domain],
        shortenPrefs = store.shortenPrefs,
        shortenData;

    sendData.account = JSON.stringify(svcData);

    // hide the panel now, but only if the extension can show status
    // itself (0.7.7 or greater)
    updateChromeStatus(SHARE_START);
    if (isGreaterThan076) {
      hide();
    }

    //First see if a bitly URL is needed.
    if (svcConfig.shorten && shortenPrefs) {
      shortenData = {
        format: 'json',
        longUrl: sendData.link
      };

      // Unpack the user prefs
      shortenPrefs = JSON.parse(shortenPrefs);

      if (shortenPrefs) {
        object.mixin(shortenData, shortenPrefs, true);
      }

      // Make sure the server does not try to shorten.
      delete sendData.shorten;

      $.ajax({
        url: 'http://api.bitly.com/v3/shorten',
        type: 'GET',
        data: shortenData,
        dataType: 'json',
        success: function (json) {
          sendData.shorturl = json.data.url;
          callSendApi();
        },
        error: function (xhr, textStatus, errorThrown) {
          showStatus('statusShortenerError', errorThrown);
        }
      });
    } else {
      callSendApi();
    }
  }

  /**
   * Shows the accounts after any AccountPanel overlays have been loaded.
   */
  function displayAccounts() {
    var lastSelectionMatch = 0,
        container = document.createElement("div"),
        debugPanel,
        i = 0;

    container.setAttribute("id", "account-accordion");
    $('#shareui').removeClass('hidden');

    if (shareApps.length==0) {
      showStatus('statusNoApps');
      return;
    }

    //Figure out what accounts we do have
    shareApps.forEach(function (app) {
      var data, PanelCtor,
          name = app.manifest.name;

      //Make sure to see if there is a match for last selection
      if (name === store.lastSelection) {
          lastSelectionMatch = i;
      }
      var tabName = "svc-frame-" + i;
      var div = document.createElement("div");
      var a = document.createElement("a")
      a.setAttribute("href", "#"+tabName);
      a.textContent = name;
      div.appendChild(a);
      container.appendChild(div);
      var iframe = document.createElement("iframe");
      iframe.setAttribute("id", tabName);
      iframe.setAttribute("src", app.url);
      container.appendChild(iframe);
      i++;
    });

    // add the account panels now
    $('#accounts').append(container);

/***
    //Add debug panel if it is allowed.
    if (options.prefs.system === 'dev') {
      debugPanel = new DebugPanel({}, accountsDom[0]);
    }
**/

    checkBase64Preview();
    // which domain was last active?
    $("#account-accordion").accordion({ active: lastSelectionMatch });

    //Inform extension the content size has changed, but use a delay,
    //to allow any reflow/adjustments.
    setTimeout(function () {
      dispatch.pub('sizeToContent');
    }, 100);
  }

  function updateAccounts(accounts) {
    var panelOverlays = [],
        panelOverlayMap = {},
        //Only do one overlay request per domain. This can be removed
        //when requirejs is updated to 0.23.0 or later.
        processedDomains = {};

    if ((accounts && accounts.length)) {
      //Collect any UI overrides used for AccountPanel based on the services
      //the user has configured.
      accounts.forEach(function (account) {
        // protect against old style account data
        if (typeof(account.profile) === 'undefined') return;

        var domain = account.profile.accounts[0].domain,
            overlays = actions[domain].overlays,
            overlay = overlays && overlays['widgets/AccountPanel'];
        if (overlay && !processedDomains[domain]) {
          panelOverlays.push(overlay);
          panelOverlayMap[domain] = overlay;
          processedDomains[domain] = true;
        }
      });

      if (panelOverlays.length) {
        require(panelOverlays, function () {
          displayAccounts(accounts, panelOverlayMap);
        });
      } else {
        displayAccounts(accounts, panelOverlayMap);
      }
    } else {
      showStatus('statusSettings');

      //Clean up storage
      services.domainList.forEach(function (domain) {
        delete store[services.domains[domain].type + 'Contacts'];
      });

      dispatch.pub('sizeToContent');
    }

  }

  function handleMessage(event)
  {
    // message is posted by OWA directly from our own iframe.
    // Is this origin check necessary?
    console.log("handleMessage from", event.origin);
    dump("handleMessage from " + event.origin);
    var myOrigin = window.location.protocol + "//" + window.location.host;
    if (event.origin === myOrigin)
    {
      var cmdRequest = JSON.parse(event.data);
      if (cmdRequest.cmd == "setup" && cmdRequest.args) {
        shareApps = cmdRequest.serviceList;
        // cleanup any old channels.
        while (shareChannels.length) {
          shareChannels.pop().destroy();
        }
        // delete any old pageinfos
        $("#pageInfo").remove();
        // and old accounts/labels
        $("#account-accordion").remove();

        // Extract options and update the page info at the top.
        for (var prop in cmdRequest.args) {
          if (cmdRequest.args.hasOwnProperty(prop)) {
            options[prop] = cmdRequest.args[prop];
          }
        }
        pageInfo = new PageInfo({
          options: options
        }, $('.sharebox')[0], 'prepend');
        // finally ready to update the DOM and create the channels for the
        // services...
        displayAccounts();
//      } else if (cmdRequest.cmd === "start_channels") {
        createChannels();
      }
    }
  }

  //For the "new items" link, only show it for x number of days after showing it.
  //NOTE: when updating for newer releases, delete the old value from the
  //storage.
  delete store.newTimerV1;
  delete store.newTimerV2;
  timer = store.newTimerV3;
  if (!timer) {
    store.newTimerV3 = (new Date()).getTime();
    showNew = true;
  } else {
    timer = JSON.parse(timer);
    //If time since first seen is greater than three days, hide the new link.
    if ((new Date()).getTime() - timer < (3 * 24 * 60 * 60 * 1000)) {
      showNew = true;
    }
  }

  // from OWA
  window.addEventListener("message", handleMessage, false);

  $(function () {
    //Set the type of system as a class on the UI to show/hide things in
    //dev vs. production
    if (options.prefs.system) {
      $(document.documentElement).addClass(options.prefs.system);
    }
    if (options.ui === 'sidebar') {
      $("#panelHeader").text('');
      $("#closeLink").addClass('hidden');
    }

    //Show the new link if appropriate.
    if (showNew) {
      $('#newLink').removeClass('hidden');
    }

    //Listen to sendMessage events from the AccountPanels
    dispatch.sub('sendMessage', function (data) {
      sendMessage(data);
    });

    // Listen for 503 errors, could be a retry call, but for
    // now, just show server error until better feedback is
    // worked out in https://bugzilla.mozilla.org/show_bug.cgi?id=642653
    dispatch.sub('serverErrorPossibleRetry', function (data) {
      showStatus('statusServerBusy');
    });

    bodyDom = $('body');
    bodyDom
      .delegate('#statusAuthButton, .statusErrorButton', 'click', function (evt) {
        cancelStatus();
      })
      .delegate('.statusErrorCloseButton', 'click', function (evt) {
        cancelStatus();
      })
      .delegate('.statusResetErrorButton', 'click', function (evt) {
        location.reload();
      })
      .delegate('nav .close', 'click', close);

    $('#authOkButton').click(function (evt) {
      oauth(sendData.domain, false, function (success) {
        if (success) {
          accounts.clear();
          accounts();
        } else {
          showStatus('statusOAuthFailed');
        }
      });
    });

    $('#captchaButton').click(function (evt) {
      cancelStatus();
      $('#clickBlock').removeClass('hidden');
      sendData.HumanVerification = $('#captcha').attr('value');
      sendData.HumanVerificationImage = $('#captchaImage').attr('src');
      sendMessage(sendData);
    });

    //Set up default handler for account changes triggered from other
    //windows, or updates to expired cache.
    accounts.onChange();

    //Only bother with localStorage enabled storage.
    if (storage.type === 'memory') {
      showStatus('statusEnableLocalStorage');
      return;
    }

    //Show the page info at the top.
    pageInfo = new PageInfo({
      options: options
    }, $('.sharebox')[0], 'prepend');

    // there is so much I don't grok about js/jquery - the DOM is ready when
    // we get to here, so why does the call have no effect unless done on a
    // timeout???
    //setTimeout(displayAccounts, 100);
    //Fetch the accounts.
/***    
    accounts(
      updateAccounts,

      //Error handler for account fetch
      function (xhr, textStatus, err) {
        if (xhr.status === 503) {
          showStatus('statusServerBusyClose');
        } else {
          showStatus('statusServerError', err);
        }
      }
    );
***/
    // watch for hash changes, update options and trigger
    // update event. However, if it has been more than a day,
    // refresh the UI.
    var refreshStamp = (new Date()).getTime(),
        //1 day.
        refreshInterval = 1 * 24 * 60 * 60 * 1000;

    window.addEventListener("hashchange", function () {
      var now = (new Date()).getTime();
      if (now - refreshStamp > refreshInterval) {
        //Force contact with the server via the true argument.
        location.reload(true);
      } else {
        // XXX we could move to pure post message, see shareStateUpdate
        options = shareOptions();

        dispatch.pub('getShareState', null);
        dispatch.pub('optionsChanged', options);
        checkBase64Preview();

        //Check that accounts are still available, but do it in the
        //background.
        accounts();

        //Tell the extension that the size of the content may have changed.
        dispatch.pub('sizeToContent');
      }
    }, false);
  });
});
