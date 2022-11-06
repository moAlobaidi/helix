import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Home = () => {
  const [tokenURL, setTokenURL] = useState("");

  const history = useHistory();
  const getAddressAndIdFromURL = (url) => {
    //https://testnets.opensea.io/assets/goerli/0x3a1e7aba44bf21a66344d7a0f795a7df0b49ed60/30536
    const partsArray = url.split("/");
    const tokenAddress = partsArray[5];
    const tokenID = partsArray[6];
    return { tokenAddress: tokenAddress, tokenID: tokenID };
  };

  getAddressAndIdFromURL(
    "https://testnets.opensea.io/assets/goerli/0x3a1e7aba44bf21a66344d7a0f795a7df0b49ed60/30536"
  );

  function handleSubmit() {
    const { tokenAddress, tokenID } = getAddressAndIdFromURL(tokenURL);
    history.push(
      "/checkout?tokenID=" +
        encodeURIComponent(tokenID) +
        "&tokenAddress=" +
        encodeURIComponent(tokenAddress)
    );
  }

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
      <div className="sr-main">
        <div className={"button thingy"}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "93%",
              marginTop: "80px",
            }}
          >
            <ConnectButton />
          </div>
          <section
            className="container"
            style={{
              backgroundColor: "white",
              marginTop: 30,
              boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            }}
          >
            <div style={{ backgroundColor: "white" }}>
              <h1 style={{ color: "midnightblue", textAlign: "center" }}>
                Input your NFT
              </h1>
            </div>
            <input
              type="text"
              placeholder={"OpenSea link"}
              value={tokenURL}
              onChange={(e) => setTokenURL(e.target.value)}
              style={{ marginTop: 7 }}
            />
            <button
              role="link"
              onClick={handleSubmit}
              style={{ backgroundColor: "midnightblue", color: "white" }}
            >
              Submit
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
