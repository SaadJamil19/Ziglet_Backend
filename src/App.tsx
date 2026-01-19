import { useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as stationWallets } from "@cosmos-kit/station";

import { zigChain, zigAssets } from "./config/chain";
import { GameCanvas } from "./components/game/GameCanvas";
import { GameHUD } from "./components/ui/GameHUD";
import { TourGuideModal } from "./components/ui/TourGuideModal";

function App() {
  const [isWatering, setIsWatering] = useState(false);

  const triggerWatering = () => {
    if (!isWatering) {
      console.log("Watering Triggered!");
      setIsWatering(true);
      setTimeout(() => setIsWatering(false), 4000);
    }
  };

  return (
    <ChainProvider
      chains={[zigChain]}
      assetLists={[zigAssets]}
      wallets={[
        ...keplrWallets,
        ...leapWallets,
        ...cosmostationWallets,
        ...stationWallets,
      ]}
      walletConnectOptions={{
        signClient: {
          projectId: "a8510432ebb71e6948cfd6cde54b70f7",
          relayUrl: "wss://relay.walletconnect.org",
          metadata: {
            name: "Ziglet Garden",
            description: "Isometric Farming on Zigchain",
            url: "https://minigame.zigchain.com",
            icons: ["https://minigame.zigchain.com/logo.png"],
          },
        },
      }}
    >
      <div className="game-container">
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            className: "ziglet-toast",
            descriptionClassName: "ziglet-toast__desc",
          }}
        />
        <TourGuideModal />
        <GameHUD onWater={triggerWatering} />
        <GameCanvas isWatering={isWatering} />
      </div>
    </ChainProvider>
  );
}

export default App;
