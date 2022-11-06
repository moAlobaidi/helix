import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Checkout from "./components/Checkout";
import Success from "./components/Success";
import Canceled from "./components/Canceled";
import Navbar from "./components/Navbar";
import "./css/normalize.css";
import "./css/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "react-query";
import Home from "./components/Home";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.goerli, chain.polygon, chain.optimism],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

//react query
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <Router>
            <Switch>
              <Route path="/success.html">
                <Success />
              </Route>
              <Route path="/canceled.html">
                <Canceled />
              </Route>
              <Route path="/checkout" component={Checkout} />
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
