import { useEffect, useState, useRef } from "react";
import {
  Send,
  Image,
  Paperclip,
  ChevronDown,
  Pencil,
  Trash2,
  Download,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";

const MessagesPage = () => {
  const { user } = useAuth();

  const {
    conversations,
    setConversations,
    messages,
    fetchMessages,
    fetchConversations,
    sendMessage,
    markConversationRead,
    updateMessage,
    deleteMessage,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [openDeleteConvoDialog, setOpenDeleteConvoDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);
    markConversationRead(selectedConversation.id, { userId: user.id });
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!message.trim() && !file && !image) return;

    const formData = new FormData();

    formData.append("conversationId", selectedConversation.id);
    formData.append("receiverId", selectedConversation.otherUser.id);
    formData.append("senderId", user.id);
    formData.append("message", message);

    if (image) formData.append("image", image);
    if (file) formData.append("file", file);

    await sendMessage(formData);

    setMessage("");
    setFile(null);
    setImage(null);
  };

  const handleUpdateMessage = async (msgId, editText) => {
    await setEditText("");
    await setEditingMessage(null);
    await updateMessage(msgId, editText);
    await fetchConversations();
  };

  const openDelete = (c) => {
    setSelected(c);
    setOpenDeleteConvoDialog(true);
    setSelectedConversation(null);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteConvoDialog(false);
    setSelected(null);
  };

  const handleDeleteMessage = async (msgId) => {
    await deleteMessage(msgId);
    await fetchConversations();
  };

  const deleteConversation = async () => {
    const res = await fetch(
      `http://localhost:5000/api/messages/conversations/${selected.id}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== selected.id));

      if (selectedConversation?.id === selected.id) {
        setSelectedConversation(null);
      }
    }
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

      {!selectedConversation && (
        <Card className="">
          <CardContent className="p-0">
            {conversations.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet.
              </div>
            )}

            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`relative flex items-center border-b hover:bg-accent
                ${selectedConversation?.id === conversation.id ? "bg-accent" : "bg-primary/10"}`}
              >
                <button
                  onClick={() => setSelectedConversation(conversation)}
                  className="flex-1 p-4 flex gap-3 text-left"
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
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">
                        {conversation.otherUser.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            conversation.last_message_at,
                          ).toLocaleDateString("en-NG")}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="mr-3 p-1 rounded hover:bg-muted">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => openDelete(conversation)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Conversation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <p className="text-xs truncate text-muted-foreground">
                      {conversation.last_message || "No messages yet"}
                    </p>
                  </div>

                  {conversation.unread_count > 0 && (
                    <div className="h-7 w-7 rounded-full pt-1 text-center text-white font-bold bg-primary mt-2">
                      {conversation.unread_count}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedConversation && (
        <Card className="">
          {!selectedConversation ? (
            <CardContent className="flex-1 p-4 flex justify-center items-center text-muted-foreground">
              Select a conversation
            </CardContent>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft size={20} />
                </Button>

                <Avatar>
                  <AvatarImage
                    src={`http://localhost:5000/uploads/avatars/${selectedConversation.otherUser.avatar}`}
                  />
                  <AvatarFallback>
                    {selectedConversation.otherUser.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-semibold">
                    {selectedConversation.otherUser.name}
                  </p>
                </div>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex `}
                      style={{
                        justifyContent: ` ${
                          msg.sender_id == user.id ? "end" : "start"
                        }`,
                      }}
                    >
                      <div
                        className={`relative group max-w-[70%] rounded-2xl px-4 py-2
                                    ${
                                      msg.sender_id == user.id
                                        ? "bg-accent rounded-tr-sm"
                                        : "bg-primary text-primary-foreground rounded-tl-sm"
                                    }`}
                      >
                        {/* Dropdown */}

                        {msg.sender_id == user.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                <ChevronDown size={16} />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {!msg.image && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingMessage(msg.id);
                                    setEditText(msg.message);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                Delete
                              </DropdownMenuItem>

                              {msg.image && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `http://localhost:5000/uploads/messages/${msg.image}`,
                                    )
                                  }
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {msg.image && (
                          <img
                            src={`http://localhost:5000/uploads/messages/${msg.image}`}
                            className="rounded-lg object-cover mb-2 max-h-[250px] max-w-[300px]"
                            style={{ width: "250px", height: "250px" }}
                          />
                        )}

                        {editingMessage === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full rounded border p-2 text-black"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />

                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMessage(null)}
                              >
                                Cancel
                              </Button>

                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateMessage(msg.id, editText)
                                }
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          msg.message && (
                            <p
                              className="text-sm whitespace-pre-wrap break-words"
                              style={{ maxWidth: "300px" }}
                            >
                              {msg.message}
                            </p>
                          )
                        )}

                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-t p-3 flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  hidden
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    if (selected) setImage(selected);
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => imageInputRef.current.click()}
                >
                  <Image size={18} />
                </Button>

                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-16 rounded mt-2"
                  />
                )}

                {file && (
                  <p className="text-xs text-muted-foreground">
                    📎 {file.name}
                  </p>
                )}

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
      )}

      <AlertDialog
        open={openDeleteConvoDialog}
        onOpenChange={setOpenDeleteConvoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Conversations with{" "}
              <strong>{selected?.otherUser.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessagesPage;
