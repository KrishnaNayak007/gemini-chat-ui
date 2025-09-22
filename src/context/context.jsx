import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord); // store full object
    }, 70 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const onSend = async (prompt) => {
    try {
      setLoading(true);
      setShowResult(true);

      const query = prompt || input;

      const response = await runChat(query);
      console.log("Gemini response:", response); // Log the full response

      if (response) {
        setRecentPrompt(query);
        setPrevPrompts((prev) => {
          if (!prev.includes(query)) {
            return [query, ...prev]; // add new prompt at the top
          }
          return prev; // don’t duplicate
        });

        setResultData("");

        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
          if (i === 0 || i % 2 !== 1) {
            newResponse += responseArray[i];
          } else {
            newResponse += `<b>${responseArray[i]}</b>`;
          }
        }
        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponseArray = newResponse2.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
          const nextWord = newResponseArray[i];
          delayPara(i, nextWord + " ");
        }

        setLoading(false);
        setInput("");
      }
    } catch (error) {
      console.error("Error in onSend:", error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSend,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };
  return (
    <context.Provider value={contextValue}>{props.children}</context.Provider>
  );
};

export default ContextProvider;
