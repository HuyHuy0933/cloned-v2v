import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import configureAppStore from "./features/configureStore.ts";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CurrentUserProvider } from "./hooks/current-user/CurrentUserProvider.tsx";
import "./locales/i18n";

export const queryClient = new QueryClient();

const { store, persistor } = configureAppStore();
export type RootState = ReturnType<typeof store.getState>;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
          <CurrentUserProvider>
            <App />
          </CurrentUserProvider>
        {/* </PersistGate> */}
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);
