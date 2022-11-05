import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";

const formatPrice = ({ amount, currency, quantity }) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (let part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  const total = (quantity * amount).toFixed(2);
  return numberFormat.format(total);
};

const covalentApiKey = "ckey_ebb5aebf4ec54c8198835c01d60";
const chainID = 1;
/*
/chainID/tokens/tokenAddress/nft_metadata/tokenID/?quote-currency=USD&format=JSON&key=covalentApiKey
    "https://api.covalenthq.com/v1/" +
      chainID +
      "/tokens/" +
      tokenAddress +
      "/nft_metadata/" +
      tokenID +
      "/?quote-currency=USD&format=JSON&key=" +
      covalentApiKey
      
      tokenAddress, tokenID, chainID
*/

const getNFT = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await axios.get(
    `https://api.covalenthq.com/v1/${chainID}/tokens/${params.tokenAddress}/nft_metadata/${params.tokenID}/?quote-currency=USD&format=JSON&key=${covalentApiKey}`
  );
  return data.data.items[0].nft_data[0];
};

const Checkout = () => {
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const tokenAddress = "0x99a9b7c1116f9ceeb1652de04d5969cce509b069";
  const tokenId = "381000225";

  const { data, isSuccess } = useQuery(
    ["NFT", { tokenAddress: tokenAddress, tokenID: tokenId }],
    getNFT
  );

  useEffect(() => {
    async function fetchConfig() {
      // Fetch config from our backend.
      const { unitAmount, currency } = await fetch("/config").then((r) =>
        r.json()
      );
      setAmount(unitAmount);
      setCurrency(currency);
    }
    fetchConfig();
  }, []);

  console.log(data);
  /*
   * https://opensea.io/assets/ethereum/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/381000255
   * */

  return (
    isSuccess && (
      <div className="sr-root">
        <div className="sr-main">
          <section className="container">
            <div>
              <h1>{data.external_data.name}</h1>
              <div className="pasha-image">
                <img
                  alt="Random asset from Picsum"
                  src={data.external_data.image_256}
                  width="140"
                  height="160"
                />
              </div>
            </div>
            <form action="/create-checkout-session" method="POST">
              <input
                  type="number"
                  id="quantity-input"
                  min="1"
                  max="10"
                  value={quantity}
                  name="quantity"
                  readOnly
              />
              <button role="link" id="submit" type="submit">
                Buy {formatPrice({ amount, currency, quantity })}
              </button>
            </form>
          </section>
        </div>
      </div>
    )
  );
};

export default Checkout;
