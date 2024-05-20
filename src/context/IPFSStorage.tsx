// ** React Imports
import {
  ReactNode,
  createContext,
  useContext,
} from "react";

// ** Lit Protocol Imports
import * as LitJsSdk from "@lit-protocol/lit-node-client";

// ** Custom Hooks Imports
import { useAccount } from "wagmi";
import { useLitProtocol } from "./litProtocol";

interface IPFSStorage {
  uploadEncripted: (
    file: any,
  ) => Promise<{
    ciphertext: string;
    dataToEncryptHash: string;
} | undefined>
}

const IPFSStorageContext = createContext<IPFSStorage>({} as IPFSStorage);

export function IPFSStorageProvider({ children }: { children: ReactNode }) {
  const { client: litClient, litSignature } = useLitProtocol();
  const { address } = useAccount();

  const uploadEncripted = async (file: any) => {
    try {
      if (!file) throw new Error("file is required");
      if (!litSignature) throw new Error("Lit-protocol auth is required");

      const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "amoy",
          method: "",
          parameters: [`${address}`],
          returnValueTest: { comparator: "=", value: ":userAddress" },
        },
      ];

      const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptFile(
        {
          accessControlConditions,
          authSig: litSignature,
          chain: "amoy",
          file,
        },
        litClient as LitJsSdk.LitNodeClient
      );

      return { ciphertext, dataToEncryptHash }
    } catch (error) {
      console.log("Error uploading encrypted file to IPFS:", error);
    }
  };

  const value: IPFSStorage = {
    uploadEncripted,
  };

  return (
    <IPFSStorageContext.Provider value={value}>
      {children}
    </IPFSStorageContext.Provider>
  );
}

export function useIPFSStorage() {
  return useContext(IPFSStorageContext);
}
