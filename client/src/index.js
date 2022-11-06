import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Checkout from "./components/Checkout";
import Success from "./components/Success";
import Canceled from "./components/Canceled";
import "./css/normalize.css";
import "./css/global.css";

//react query
import {QueryClient, QueryClientProvider} from "react-query";
import Home from "./components/Home";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
