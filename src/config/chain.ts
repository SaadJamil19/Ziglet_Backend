import type { Chain, AssetList } from "@chain-registry/types";

export const zigChain: Chain = {
  chain_name: "zigchain",
  status: "live",
  network_type: "testnet",
  pretty_name: "Zigchain Antigravity",
  chain_id: "zig-1",
  bech32_prefix: "zig",
  daemon_name: "zigd",
  node_home: "$HOME/.zigd",
  key_algos: ["secp256k1"],
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: "uzig",
        fixed_min_gas_price: 0.025,
        low_gas_price: 0.025,
        average_gas_price: 0.025,
        high_gas_price: 0.04,
      },
    ],
  },
  staking: {
    staking_tokens: [
      {
        denom: "uzig",
      },
    ],
  },
  codebase: {},
  apis: {
    rpc: [
      {
        address: "https://rpc.antigravity.zigchain.com",
        provider: "ZigFoundation",
      },
    ],
    rest: [
      {
        address: "https://api.antigravity.zigchain.com",
        provider: "ZigFoundation",
      },
    ],
  },
  explorers: [],
};

export const zigAssets: AssetList = {
  chain_name: "zigchain",
  assets: [
    {
      description: "The native token of Zigchain",
      denom_units: [
        {
          denom: "uzig",
          exponent: 0,
        },
        {
          denom: "zig",
          exponent: 6,
        },
      ],
      base: "uzig",
      name: "Zig",
      display: "zig",
      symbol: "ZIG",
    },
  ],
};
