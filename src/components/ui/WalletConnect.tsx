import React, { useState, useEffect, useRef } from "react";
import { useChain } from "@cosmos-kit/react";
import { useWalletStore } from "../../store/walletStore";
import { useSessionStore } from "../../store/sessionStore";
import { useBackendStore } from "../../store/backendStore";
import { zigletApi } from "../../api/zigletApi";
import "./WalletConnect.css";

export const WalletConnect = () => {
  const { address, status, walletRepo, disconnect, signArbitrary, getAccount } =
    useChain("zigchain");
  const { setAddress, setStatus } = useWalletStore();
  const { token, zigAddress, setSession, clearSession } = useSessionStore();
  const { reset } = useBackendStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nonZigNotice, setNonZigNotice] = useState<string | null>(null);
  const authInFlightRef = useRef(false);

  // Sync Store
  useEffect(() => {
    setAddress(address || null);
    // TypeScript might bitch about status strings matching exactly, ensuring compatibility or casting
    setStatus(status as any);
  }, [address, status, setAddress, setStatus]);

  const playClickSound = () => {
    // Placeholder for audio manager
    // const audio = new Audio('/sounds/ui_click.mp3');
    // audio.play().catch(() => {});
  };

  const handleOpenModal = () => {
    playClickSound();
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener("ziglet:open-wallet", handler);
    return () => window.removeEventListener("ziglet:open-wallet", handler);
  }, []);
/*  */
  const notifyNonZig = () => {
    setNonZigNotice("Only Zigchain (zig1...) wallets are supported.");
    window.setTimeout(() => setNonZigNotice(null), 2500);
  };

  const handleConnect = async (walletName: string) => {
    playClickSound();
    const wallet = walletRepo.wallets.find((w) => w.walletName === walletName);
    if (wallet) {
      await wallet.connect();
      if (wallet.address && !wallet.address.startsWith("zig1")) {
        console.warn("Non-zig address detected, disconnecting.");
        disconnect();
        clearSession();
        reset();
        localStorage.removeItem("ziglet_session");
        notifyNonZig();
        return;
      }
      setIsModalOpen(false);
    }
  };

  const handleDisconnect = () => {
    playClickSound();
    disconnect();
    clearSession();
    reset();
    localStorage.removeItem("ziglet_session");
  };

  const toBase64 = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes));

  const authenticate = async () => {
    if (!address || !signArbitrary || authInFlightRef.current) return;
    authInFlightRef.current = true;
    try {
      const { nonce } = await zigletApi.getNonce(address);
      const signature = await signArbitrary(address, nonce);

      let pubKey = signature?.pub_key;
      if (!pubKey?.value && getAccount) {
        const account = await getAccount();
        if (account?.pubkey) {
          pubKey = {
            type: "tendermint/PubKeySecp256k1",
            value: toBase64(account.pubkey),
          };
        }
      }

      if (!pubKey?.value) {
        throw new Error("Missing public key from wallet signature.");
      }

      const { token: jwtToken, user } = await zigletApi.verifySignature(
        address,
        pubKey,
        signature.signature
      );
      setSession(jwtToken, user);
      localStorage.setItem(
        "ziglet_session",
        JSON.stringify({ token: jwtToken, user })
      );
    } catch (error) {
      console.error("Backend auth failed:", error);
    } finally {
      authInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!token) {
      const raw = localStorage.getItem("ziglet_session");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.token && parsed?.user) {
            setSession(parsed.token, parsed.user);
          }
        } catch {
          localStorage.removeItem("ziglet_session");
        }
      }
    }
  }, [token, setSession]);

  useEffect(() => {
    if (!address) return;
    if (zigAddress && zigAddress !== address) {
      clearSession();
      reset();
      localStorage.removeItem("ziglet_session");
    }
  }, [address, zigAddress, clearSession, reset]);

  useEffect(() => {
    if (status === "Connected" && address) {
      if (!address.startsWith("zig1")) {
        disconnect();
        clearSession();
        reset();
        localStorage.removeItem("ziglet_session");
        notifyNonZig();
        return;
      }
      if (!token) {
        void authenticate();
      }
    }
  }, [status, address, token]);

  // CONNECTED VIEW
  if (status === "Connected" && address) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-all hover:bg-white/10 border border-white/5"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
        }}
        onClick={handleDisconnect}
        title="Click to Disconnect"
      >
        <div className="relative flex items-center justify-center w-3 h-3">
          <div className="absolute w-full h-full rounded-full bg-[#66bb6a] animate-ping opacity-75"></div>
          <div className="relative w-2 h-2 rounded-full bg-[#66bb6a] shadow-[0_0_8px_#66bb6a]"></div>
        </div>
        <span className="font-mono text-sm tracking-wide text-[#a5d6a7] font-bold">
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  // DISCONNECTED VIEW
  return (
    <>
      {nonZigNotice && (
        <div className="wallet-toast">
          {nonZigNotice}
        </div>
      )}
      <button onClick={handleOpenModal} className="wallet-connect-button">
        CONNECT WALLET
      </button>

      {/* CUSTOM GLASSMORPHISM MODAL */}
      {isModalOpen && (
        <div className="wallet-modal-overlay">
          {/* Modal Content */}
          <div
            className="wallet-modal-panel"
            style={{
              background: "rgba(10, 31, 15, 0.90)", // Darkest Green with opacity
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold text-white tracking-widest"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                SELECT WALLET
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/50 hover:text-[#00f5ff] transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Wallet List */}
            <div className="space-y-3">
              {walletRepo.wallets.map((w) => (
                <button
                  key={w.walletName}
                  onClick={() => handleConnect(w.walletName)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00f5ff]/50 transition-all group"
                >
                  {/* Logo Handling */}
                  <div className="w-10 h-10 flex items-center justify-center bg-black/20 rounded-lg p-1.5 grayscale group-hover:grayscale-0 transition-all">
                    {typeof w.walletInfo.logo === "string" ? (
                      <img
                        src={w.walletInfo.logo}
                        alt={w.walletPrettyName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-500 rounded-full" />
                    )}
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-base font-bold text-gray-200 group-hover:text-[#00f5ff] transition-colors">
                      {w.walletPrettyName}
                    </span>
                    <span className="text-xs text-white/40 group-hover:text-white/60">
                      {w.walletInfo.mode === "extension"
                        ? "Extension"
                        : "Mobile App"}
                    </span>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-[#00f5ff]">
                    →
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/30">
                By connecting, you agree to the{" "}
                <span className="text-white/50 hover:text-[#00f5ff] cursor-pointer">
                  Terms of Service
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
