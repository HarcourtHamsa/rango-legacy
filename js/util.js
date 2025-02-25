export function getCryptoSymbol(cryptoName) {
  return new Promise(function (resolve, reject) {
    $.getJSON("/js/cryptocurrencies.json")
      .done(function (data) {
        // Convert input to lowercase for case-insensitive comparison
        const searchTerm = cryptoName.toLowerCase();

        // Create different matching categories
        let exactMatch = null;
        let startsWithMatch = null;
        let containsMatch = null;

        // Search through all cryptocurrencies
        for (const [symbol, name] of Object.entries(data)) {
          const lowerName = name.toLowerCase();

          // Check for exact match
          if (lowerName === searchTerm) {
            exactMatch = symbol;
            break; // Exit early if exact match found
          }

          // Check if the full name starts with the search term
          if (lowerName.startsWith(searchTerm)) {
            startsWithMatch = symbol;
            // Don't break, continue looking for exact match
          }

          // Check if the search term is contained within the name
          if (lowerName.includes(searchTerm)) {
            containsMatch = symbol;
            // Don't break, continue looking for better matches
          }
        }

        // Return the best match found, prioritizing exactMatch > startsWithMatch > containsMatch
        if (exactMatch) {
          resolve(exactMatch);
        } else if (startsWithMatch) {
          resolve(startsWithMatch);
        } else if (containsMatch) {
          resolve(containsMatch);
        } else {
          resolve("Cryptocurrency not found");
        }
      })
      .fail(function (jqxhr, textStatus, error) {
        reject("Error: " + error);
      });
  });
}

export function getCryptoExchangeData(amountIn, fromChain, toChain) {
  return new Promise(function (resolve, reject) {
    // Base URL and hardcoded parameters
    const baseUrl = "https://price-api.mayan.finance/v3/quote";
    const params = {
      wormhole: true,
      swift: true,
      mctp: true,
      shuttle: false,
      gasless: true,
      onlyDirect: false,
      amountIn: amountIn,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromChain: fromChain,
      toToken: "0x0000000000000000000000000000000000000000",
      toChain: toChain,
      slippageBps: "auto",
      referrer: "7HN4qCvG2dP5oagZRxj2dTGPhksgRnKCaLPjtjKEr1Ho",
      gasDrop: 0,
      sdkVersion: "10_2_0",
    };

    // Convert params object to URL query string
    const queryString = $.param(params);
    const fullUrl = `${baseUrl}?${queryString}`;

    // Make the GET request
    $.ajax({
      url: fullUrl,
      method: "GET",
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        reject(`Error fetching crypto exchange data: ${error}`);
      },
    });
  });
}

export function formatCryptoAmount(amount, decimalPlaces = 8) {
  // Convert the amount to a number and fix the decimal places
  let formattedAmount = Number(amount).toFixed(decimalPlaces);

  // Add commas as thousand separators
  formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return formattedAmount;
}
