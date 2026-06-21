import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MessagesContext = createContext();

const socket = io("http://localhost:5000");

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/conversations/${user.id}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages
  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${conversationId}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMessages(data);
      setActiveConversation(conversationId);
    } catch (err) {
      console.error(err);
    }
  };

  const createNewConversation = async (convo) => {
    const res = await fetch("http://localhost:5000/api/messages/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convo),
    });

    return await res.json();
  };

  // Send message
  const sendMessage = async (formData) => {
    const res = await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      body: formData, // IMPORTANT: no JSON headers
    });

    const data = await res.json();

    if (res.ok) {
      setMessages((prev) => [...prev, data]);

      setConversations((prev) =>
        prev.map((c) =>
          c.id == formData.get("conversationId")
            ? {
                ...c,
                last_message: formData.get("message"),
                last_message_at: data.created_at,
              }
            : c,
        ),
      );
    }
  };

  // Mark conversation read
  const markConversationRead = async (conversationId, userId) => {
    try {
      await fetch(`http://localhost:5000/api/messages/read/${conversationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userId),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateMessage = async (id, message) => {
    const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, message } : m)),
      );
    }
  };

  const deleteMessage = async (id) => {
    const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Socket setup
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join", user.id);

    socket.on("new-message", (message) => {
      // Add to open chat
      if (message.conversation_id === activeConversation) {
        setMessages((prev) => [...prev, message]);
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversation_id
            ? {
                ...c,
                last_message: message.message,
                last_message_at: message.created_at,
                unread_count:
                  activeConversation === message.conversation_id
                    ? 0
                    : (c.unread_count || 0) + 1,
              }
            : c,
        ),
      );
    });

    socket.on("new-conversation", (conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);

        if (exists) return prev;

        return [conversation, ...prev];
      });
    });

    return () => {
      socket.off("new-message");
      socket.off("new-conversation");
    };
  }, [user, activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        setConversations,
        createNewConversation,
        messages,
        activeConversation,
        setActiveConversation,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markConversationRead,
        updateMessage,
        deleteMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error("useMessages must be used inside a MessagesProvider");
  }

  return context;
};
