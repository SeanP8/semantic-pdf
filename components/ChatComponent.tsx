"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import MessageList from "./MessageList";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      console.log(
        `====== get messages response ${JSON.stringify(response.data)} ola`
      );

      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="h-screen relative max-h-screen " id="message-container">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      {/* message list */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 my-2 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about your document..."
            className="w-full"
          />
          <Button>
            <Send />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
