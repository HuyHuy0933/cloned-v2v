import { RouterProvider } from "react-router-dom";
import "./App.css";
import { Suspense, useEffect } from "react";
import { CustomCursor, Spinner, Toaster } from "./components";
import { useRouter } from "./routes";
import { useSelector } from "react-redux";
import { RootState } from "./main";
import {
  useAlertNetworkStatus,
  useInitAeonDefaultEntities,
  useInitDefaultClonedVoices,
  useInitDefaultAudioDevices,
} from "./hooks";
import { isDesktop, LOCAL_STORAGE_KEY } from "./lib/constaints";

const redirectTo = localStorage.getItem(LOCAL_STORAGE_KEY.redirect_to);

const FallBack = () => {
  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <Spinner />
    </div>
  );
};

function App() {
  useInitAeonDefaultEntities();
  useInitDefaultClonedVoices();
  useInitDefaultAudioDevices();
  useAlertNetworkStatus();
  const cursorColor = useSelector((state: RootState) => state.ui.cursorColor);
  const { router } = useRouter();

  useEffect(() => {
    if (redirectTo) {
      localStorage.removeItem(LOCAL_STORAGE_KEY.redirect_to);
      window.location.href = redirectTo;
    }
  }, []);

  return (
    <Suspense fallback={<FallBack />}>
      <RouterProvider router={router} fallbackElement={<div>Loading...</div>} />
      {isDesktop && <CustomCursor color={cursorColor} />}
      <Toaster />
    </Suspense>
  );
}

export default App;
