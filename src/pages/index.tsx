import { WalletAccount } from "@/components/WalletAccount";
import { WalletOptions } from "@/components/WalletOptions";
import { useIPFSStorage } from "@/context/IPFSStorage";
import { useLitProtocol } from "@/context/litProtocol";
import { ChangeEvent, useState } from "react"
import { useAccount } from "wagmi";

export default function Home() {
  const [input, setInput] = useState({
    text: ""
  });

  const { isConnected } = useAccount();
  const { litSignature, generateLitSignature } = useLitProtocol();
  const { uploadEncripted } = useIPFSStorage();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: value }))
  };

  const handleSubmit = async () => {
    if (!litSignature) return;

    const textFile = new File([input.text], "text.txt", {
      type: "text/plain",
    });
    await uploadEncripted(textFile)

  };


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "1rem",
      }}
    >
      <div style={{ margin: "1rem " }}>
        {!isConnected ? <WalletOptions /> : <WalletAccount />}
      </div>
      {isConnected && !litSignature && (
        <div style={{ margin: "1rem " }}>
          <button onClick={generateLitSignature}>
            Lit signature
          </button>
        </div>
      )}
      {isConnected && litSignature && (
        <div>
          <input
            name="text"
            value={input.text}
            onChange={handleInputChange}
          />
          <button
            onClick={handleSubmit}
          >Submit</button>
        </div>
      )}
    </div>
  )
}
