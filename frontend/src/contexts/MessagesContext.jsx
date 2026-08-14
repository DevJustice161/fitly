import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MessagesContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(BACKEND_URL, {
  autoConnect: false,
});

export const MessagesProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}/messages/conversations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/all/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    const res = await fetch(`${API_URL}/messages/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(convo),
    });

    return await res.json();
  };

  const sendMessage = async (formData) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
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

  const markConversationRead = async (conversationId, userId) => {
    try {
      await fetch(`${API_URL}/messages/read/${conversationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join", user.id);

    socket.on("new-message", (message) => {
      if (message.conversation_id === activeConversation) {
        setMessages((prev) => [...prev, message]);
      }

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
    fetchAllMessages();
  }, [user, activeConversation]);

  const unreadMsgCount = allMessages.filter(
    (n) => n.receiver_id === user?.id && !n.is_read,
  ).length;

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        setConversations,
        createNewConversation,
        messages,
        unreadMsgCount,
        activeConversation,
        setActiveConversation,
        fetchConversations,
        fetchMessages,
        fetchAllMessages,
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
