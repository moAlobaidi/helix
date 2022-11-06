import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

const covalentApiKey = "ckey_ebb5aebf4ec54c8198835c01d60";
const chainID = 5;

const formatNFTPrice = (price_wei) => {
  let nftPriceInCents = axios
    .get("https://api.coinbase.com/v2/prices/ETH-USD/buy")
    .then((data) => {
      console.log(data.data.data.amount);
      const ethPriceInUSD = data.data.data.amount;
      console.log(`ethPriceInUSD: ${ethPriceInUSD}`);

      //wei to eth
      const nftPriceInETH = ethers.utils.formatEther(
        ethers.BigNumber.from(price_wei)
      );
      console.log(`nftPriceInETH: ${nftPriceInETH}`);

      //eth to usd
      const nftPriceInUSD = nftPriceInETH * ethPriceInUSD;
      console.log(`nftPriceInUSD: ${nftPriceInUSD}`);

      //usd to cents
      nftPriceInCents = nftPriceInUSD * 100;
      console.log(`nftPriceInCents: ${nftPriceInCents}`);
      return nftPriceInCents;
    })
    .catch((err) => {
      console.log("Error: ", err.message);
    });
  return nftPriceInCents;
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
      "X-API-KEY": "",
    },
  };
  const { data: openSeaListing } = await axios.get(
    `https://testnets-api.opensea.io/v2/orders/goerli/seaport/listings?asset_contract_address=${params.tokenAddress}&token_ids=${params.tokenID}&order_by=created_date&order_direction=desc`,
    config
  );
  console.log(openSeaListing);
  const covalent_data = data.data.items[0].nft_data[0];
  /*  const covalent_data = {
    external_data: {
      name: "dog",
      image_256:
        "https://i.seadn.io/gae/PZk2vEBxfBtTzweWa09_-lNFSZT9LSnHu6DrlrNU91CbGPf-gARItOb4-nWJVewOMEOnSjg-DZ3tbcnWEcKrf_4PXqwpFiwcpajo3w?auto=format&w=1000",
      description: "ur mom is cool",
    },
  };*/

  const helix_nft_data = {
    name: covalent_data.external_data.name,
    image_256: covalent_data.external_data.image,
    description: covalent_data.external_data.description,
    price_wei: openSeaListing.orders[0].current_price,
    tokenAddress: params.tokenAddress,
    tokenID: params.tokenID,
  };

  return helix_nft_data;
};

const getAddressAndIdFromURL = (url) => {
  //https://testnets.opensea.io/assets/goerli/0x3a1e7aba44bf21a66344d7a0f795a7df0b49ed60/30536
  const partsArray = url.split("/");
  console.log(partsArray);
};
const Checkout = ({ location }) => {
  const queryParams = new URLSearchParams(location.search);
  const tokenAddress = queryParams.get("tokenAddress");
  const tokenID = queryParams.get("tokenID");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const tokenData = useMemo(() => {
    return { tokenAddress: tokenAddress, tokenID: tokenID };
  }, []);
  const { data, isSuccess, isError, isLoading } = useQuery(
    ["NFT", tokenData],
    getNFT
  );
  console.log(`data.price_wei: ${data?.price_wei}`);
  getAddressAndIdFromURL(
    "https://testnets.opensea.io/assets/goerli/0x3a1e7aba44bf21a66344d7a0f795a7df0b49ed60/30536"
  );
  const { address } = useAccount();

  const handleBuyNow = async () => {
    const price = await formatNFTPrice(data.price_wei);
    if (!price) {
      console.log("could not get price");
      return;
    }
    axios
      .post("/create-product-from-nft", { data, price, address })
      .then((res) => {
        console.log(res);
        window.location.href = res.data.url;
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
  }, []);

  /*
   * https://opensea.io/assets/ethereum/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/381000255
   * */

  if (isError) {
    return <h1>Your NFT doesn't exist or is not for sale :/</h1>;
  }
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  if (isSuccess) {
    return (
      <div
        style={{
          backgroundColor: "midnightblue",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="sr-root">
          <div className="sr-main">
            <section className="container" style={{ backgroundColor: "white" }}>
              <div>
                <h1 style={{ color: "midnightblue", textAlign: "center" }}>
                  {data.name}
                </h1>
                <div className="pasha-image">
                  <img
                    alt="Random asset from Picsum"
                    src={data.image_256}
                    width="140"
                    height="160"
                  />
                </div>
              </div>
              <button
                role="link"
                onClick={handleBuyNow}
                style={{ backgroundColor: "midnightblue", color: "white" }}
              >
                Buy {parseFloat(ethers.utils.formatEther(data.price_wei))}
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }
  return <h1>This should be impossible</h1>;
};

export default Checkout;
