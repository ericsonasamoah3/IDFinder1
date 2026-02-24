import "./cognitoConfig";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "signInWithRedirect":
      getCurrentUser().then((user) => console.log("Signed in:", user));
      break;
    case "signInWithRedirect_failure":
      console.error("Sign in failed:", payload.data);
      break;
  }
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
