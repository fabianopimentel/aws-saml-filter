// ==UserScript==
// @name        aws-saml-filter
// @namespace   Violentmonkey Scripts
// @match       https://signin.aws.amazon.com/saml
// @grant       none
// @version     1.0
// @author      -
// @description 1/24/2024, 9:35:35 AM
// ==/UserScript==

window.clearSearch = function () {
  $("#searchbox > input").val("");
  $("#searchbox > input").focus();
  $("#searchbox > input").keyup();
};

$("#saml_form > p").before(
  '<div id="searchbar">\
   <div id="searchbox">\
     <input type="text" placeholder="Filter accounts and roles...">\
   </div>\
   <div id="button_container">\
     <a id="clear_button" class="css3button" href="#" style="display: inline;">Clear</a>\
   </div>\
</div>\
<div id="hint">Filter is case-insensitive and ignores dashes \'-\'. Press <b>enter</b> to sign in when your filter returns only one role.</div>'
);

$("#saml_form > p").hide();
$("#searchbar").css("display", "flex");
$("#button_container").css("padding", "24px 0 0 8px");
$("#searchbox").css("margin", "5px");
$("#searchbox").css("padding", "8px 32px");
$("#searchbox").css("width", "100%");
$("#searchbox > input").css("width", "100%");
$("#searchbox > input").css("padding", "8px 16px");
$("#searchbox > input").focus();
$("#hint").css("padding", "0 56px 12px");
$("#hint").css("margin-top", "-8px");
$("#hint").css("color", "lightgray");

$("#input_signin_button").before('<div id="filter-error"></div>');
$("#filter-error").css("padding", "0px 32px 32px");
$("#filter-error").css("font-size", "16px");

$(document).keypress(function (e) {
  if (e.which === 13) {
    $("form#saml_form").submit();
  }
});

$("#clear_button").on("click", function (e) {
  e.preventDefault();
  window.clearSearch();
  $("fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible input").prop("checked", false);
});

$("#searchbox > input").keydown(function (e) {
  if (e.which === 13) {
    var visibleRoles = $(
      "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
    );
    event.preventDefault();
    if (visibleRoles.length === 1) {
      $("form#saml_form").submit();
    }
  }
});

$("#searchbox > input").keyup(function (e) {
  if (e.which === 40) {
    $(
      "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
    )
      .first()
      .children("input")
      .focus();
    $(
      "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
    )
      .first()
      .children("input")
      .prop("checked", true);
    return;
  }

  if ($(this).val() === "") {
    $("fieldset > div.saml-account").show();
  } else {
    var keyword = $(this).val().replaceAll("-", "").toLowerCase();
    $("fieldset > div.saml-account").each(function () {
      var roles = $(this).children(".saml-account").children(".saml-role");

      roles.each(function () {
        $(this).show();
      });

      $(this).show();

      var accountName = $(this)
        .find(".saml-account-name")
        .text()
        .replaceAll("-", "")
        .toLowerCase();

      var accountNameMatch = accountName.indexOf(keyword) !== -1;

      if (accountNameMatch) {
        return;
      }

      var roleNamesConcat = $(this)
        .find(".saml-role-description")
        .text()
        .replaceAll("-", "")
        .toLowerCase();

      var searchRoles = roleNamesConcat.indexOf(keyword) !== -1;

      if (searchRoles) {
        roles.each(function () {
          var roleName = $(this)
            .find(".saml-role-description")
            .text()
            .replaceAll("-", "")
            .toLowerCase();
          if (roleName.indexOf(keyword) !== -1) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });

        return;
      }

      $(this).hide();
    });
  }

  $("#signin_button").show();

  var visibleAccounts = $("fieldset > div.saml-account:visible");

  var visibleRoles = $(
    "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
  );

  if (visibleRoles.length === 1) {
    $(
      "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
    )
      .first()
      .children("input")
      .prop("checked", true);
  } else {
    $(
      "fieldset > div.saml-account:visible > div.saml-account > div.saml-role:visible"
    )
      .children("input")
      .prop("checked", false);
  }

  if (visibleAccounts.length > 0) {
    document.getElementById("filter-error").innerHTML = "";
  } else {
    document.getElementById(
      "filter-error"
    ).innerHTML = `No accounts containing <b>${$(this).val()}</b> found.`;
    $("#signin_button").hide();
  }
});

window.addEventListener(
  "load",
  () => {
    [].forEach.call(
      document.querySelectorAll("#saml_form input[name=roleIndex]"),
      (el) => {
        el.onclick = (e) => {
          if (e.clientX !== 0 && e.clientY !== 0) {
            el.form.submit();
          }
        };
      }
    );
  },
  false
);
