import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { ethers } from "ethers";

const formatPrice = ({ amount, currency, quantity }) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
  const data = fetchETHPrice().catch((err) => {
    console.log(err);
    return;
  });
  const ethPriceInUSD = parseFloat(data.amount);
  const nftPriceInETH = parseFloat(ethers.utils.formatEther(amount));
  const nftPriceInUSD = nftPriceInETH * ethPriceInUSD;

  const total = nftPriceInUSD.toFixed(2);
  return numberFormat.format(total);
};

const covalentApiKey = "ckey_ebb5aebf4ec54c8198835c01d60";
const chainID = 1;

const fetchETHPrice = async () => {
  const { data } = await axios.get(
    `https://api.coinbase.com/v2/prices/ETH-USD/buy`
  );
  return data;
};

const getNFT = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await axios.get(
    `https://api.covalenthq.com/v1/${chainID}/tokens/${params.tokenAddress}/nft_metadata/${params.tokenID}/?quote-currency=USD&format=JSON&key=${covalentApiKey}`
  );
  //this data struct is in covalent docs
  const config = {
    headers: {
      Accept: "application/json",
      "X-API-KEY": "99ca8aaff8e1469eaa73a57dbcbb00c0",
    },
  };
  const { data: openSeaListing } = await axios.get(
    `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${params.tokenAddress}&token_ids=${params.tokenID}&order_by=created_date&order_direction=desc`,
    config
  );

  const nft_data = data.data.items[0].nft_data[0];
  const helix_nft_data = {
    external_data: nft_data.external_data,
    openseaData: openSeaListing,
    price: openSeaListing.orders[0].current_price,
  };

  return helix_nft_data;
};

const Checkout = ({ location }) => {
  const queryParams = new URLSearchParams(location.search);
  const tokenAddress = queryParams.get("tokenAddress");
  const tokenID = queryParams.get("tokenID");

  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const tokenData = useMemo(() => {
    return { tokenAddress: tokenAddress, tokenID: tokenID };
  }, []);
  const { data, isSuccess } = useQuery(["NFT", tokenData], getNFT);

  console.log(data);
  const createProductFromNFT = async (data) => {
    axios
      .post("/create-product-from-nft", {
        data,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBuyNow = async (price, quantity) => {
    axios
      .post("/create-checkout-session", {
        price,
        quantity,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
    createProductFromNFT(data).catch((err) => {
      console.log(err);
    });
  }, []);

  /*
   * https://opensea.io/assets/ethereum/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/381000255
   * */

  return (
    isSuccess && (
      <div className="sr-root" style={{backgroundColor: 'midnightblue'}}>
        <div className="sr-main">
          <section className="container" style={{backgroundColor: 'white'}}>
            <div>
              <h1 style={{color: 'midnightblue', textAlign:'center'}}>{data.external_data.name}</h1>
              <div className="pasha-image">
                <img
                  alt="Random asset from Picsum"
                  src={data.external_data.image_256}
                  width="140"
                  height="160"
                />
              </div>
            </div>
            {/*<input*/}
            {/*  type="text"*/}
            {/*  value={tokenAddress}*/}
            {/*  onChange={(e) => setTokenAddress(e.target.value)}*/}
            {/*/>*/}
            {/*<input*/}
            {/*  type="text"*/}
            {/*  value={tokenID}*/}
            {/*  onChange={(e) => setTokenAddress(e.target.value)}*/}
            {/*/>*/}
            <button role="link" onClick={handleBuyNow} style={{backgroundColor: 'midnightblue', color: 'white'}}>
              Buy {formatPrice({ amount: data.price, currency, quantity })}
            </button>
          </section>
        </div>
      </div>
    )
  );
};

export default Checkout;
