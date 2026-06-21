import { useEffect, useState, useRef } from "react";
import { Send, Image, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";

const MessagesPage = () => {
  const { user } = useAuth();

  const {
    conversations,
    messages,
    fetchMessages,
    sendMessage,
    markConversationRead,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);
    markConversationRead(selectedConversation.id);
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!message.trim()) return;

    await sendMessage({
      conversationId: selectedConversation.id,
      receiverId: selectedConversation.otherUser.id,
      message,
    });

    setMessage("");
  };

  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";

      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="font-heading text-2xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px] w-full">
        {/* Conversations */}

        <Card className="w-full md:col-span-2 overflow-hidden flex flex-col">
          <CardContent className="p-0">
            {conversations.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet.
              </div>
            )}

            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex gap-3 border-b text-left hover:bg-accent transition
                  ${
                    selectedConversation?.id === conversation.id
                      ? "bg-accent"
                      : ""
                  }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`http://localhost:5000/uploads/avatars/${conversation.otherUser.avatar}`}
                  />

                  <AvatarFallback>
                    {conversation.otherUser.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between">
                    <p
                      className={`truncate ${
                        conversation.unread_count ? "font-semibold" : ""
                      }`}
                    >
                      {conversation.otherUser.name}
                    </p>

                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        conversation.last_message_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs truncate text-muted-foreground">
                    {conversation.last_message}
                  </p>
                </div>

                {conversation.unread_count > 0 && (
                  <span className="h-2 w-2 rounded-full bg-primary mt-2"></span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat */}

        <Card className="w-full md:col-span-1 flex flex-col overflow-hidden">
          {!selectedConversation ? (
            <CardContent className="flex-1 p-4 flex justify-center items-center text-muted-foreground">
              Select a conversation
            </CardContent>
          ) : (
            <>
              <div className="border-b p-4 flex gap-3 items-center">
                <Avatar>
                  <AvatarImage
                    src={`http://localhost:5000/uploads/avatars/${selectedConversation.otherUser.avatar}`}
                  />

                  <AvatarFallback>
                    {selectedConversation.otherUser.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">
                    {selectedConversation.otherUser.name}
                  </p>
                </div>
              </div>

              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        justifyContent: ` ${
                          msg.sender_id === user.id ? "start" : "end"
                        }`,
                      }}
                      className={`flex`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2
                          ${
                            msg.sender_id == user.id
                              ? "bg-accent rounded-tl-sm"
                              : "bg-primary text-primary-foreground rounded-tr-sm"
                          }`}
                      >
                        {msg.image && (
                          <img
                            src={`http://localhost:5000/uploads/messages/${msg.image}`}
                            className="rounded mb-2 max-h-48"
                          />
                        )}

                        <p
                          className="text-sm break-words"
                          style={{ width: "500px" }}
                        >
                          {" "}
                          {user.id}
                          {msg.message}
                        </p>

                        <p className="text-[10px] opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-t p-3 flex gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip size={18} />
                </Button>

                <Button variant="ghost" size="icon">
                  <Image size={18} />
                </Button>

                <textarea
                  ref={textareaRef}
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={1}
                  style={{ resize: "none" }}
                  className="w-full min-h-[40px] max-h-[150px] overflow-y-auto rounded-xl border border-gray-300 p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <Button onClick={handleSend}>
                  <Send size={18} />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
