// ** React Imports
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// ** Lit Protocol Imports
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethConnect } from "@lit-protocol/auth-browser";

// ** Hooks
import { useAccount, useSignMessage } from "wagmi";

// ** Utils
import { SiweMessage } from "siwe";
import { AMOY_ID } from "@/config/wallet.config";

type AuthLitType = {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
};

export type LitProtocolValue = {
  client: LitJsSdk.LitNodeClient | undefined;
  litSignature: AuthLitType | null;
  generateLitSignature: () => Promise<any | undefined>;
  cleanLitCredentials: () => void;
};

const LitProtocolContext = createContext<LitProtocolValue>(
  {} as LitProtocolValue
);

/**
 * LitProtocol context provider
 */
export function LitProtocolProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<LitJsSdk.LitNodeClient>();
  const [litSign, setLitSign] = useState<AuthLitType | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    configLitClient();
  }, []);

  /**
   * Initializes the lit-protocol client
   */
  const configLitClient = async () => {
    const client = new LitJsSdk.LitNodeClient({
      litNetwork: "cayenne",
      debug: false,
    });
    await client.connect();
    setClient(client);
  };

  /**
   * Configures the auth signature
   */
  const configAuthSignature = (
    signature: string,
    message: string,
    address: string
  ): AuthLitType | undefined => {
    if (!address) return;

    return {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address,
    };
  };

  const generateSignAuthMessage = async () => {
    try {
      if (!client) throw new Error("Lit client not initialized.");
      if (!address) throw new Error("Address not found.");

      const domain = window.location.host;
      const origin = window.location.origin;

      const statement = 'Required authorization: "lit-signature"';
      const nonce = await client.getLatestBlockhash();

      const expirationTime = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ).toISOString();

      const siweMessage = new SiweMessage({
        domain,
        statement,
        uri: origin,
        chainId: AMOY_ID,
        version: "1",
        address,
        expirationTime,
        nonce: nonce as string,
      });

      const messageToSign = siweMessage.prepareMessage();

      const signature = await signMessageAsync({
        message: messageToSign
      });
      if (!signature) throw new Error("Invalid signature.");

      const authSig = configAuthSignature(
        signature,
        messageToSign,
        address
      );
      if (!authSig) throw new Error("Cannot structure auth sig properly.");

      const siweMsgGenerated = await siweMessage.verify({
        signature: authSig.sig,
      });
      if (siweMsgGenerated.success) {
        setLitSign(authSig);
        return authSig;
      }
    } catch (error) {
      console.log("Error signing lit auth:", error);
    }
  };

  const cleanCredentials = () => {
    ethConnect.disconnectWeb3();
    setLitSign(null);
  };

  const value: LitProtocolValue = {
    client,
    litSignature: litSign,
    generateLitSignature: generateSignAuthMessage,
    cleanLitCredentials: cleanCredentials,
  };

  return (
    <LitProtocolContext.Provider value={value}>
      {children}
    </LitProtocolContext.Provider>
  );
}

export function useLitProtocol() {
  return useContext(LitProtocolContext);
}
