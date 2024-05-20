import { createConfig, http } from "wagmi";
import { polygonAmoy } from "viem/chains";

export const AMOY_ID = polygonAmoy.id;

export const ALCHEMY_API_ENDPOINT = {
  [AMOY_ID]: "https://polygon-amoy.g.alchemy.com/v2",
};

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  transports: {
    [AMOY_ID]: http(`${ALCHEMY_API_ENDPOINT[AMOY_ID]}/${ALCHEMY_API_KEY}`),
  },
})
