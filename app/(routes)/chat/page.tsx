"use client";
import { motion } from "framer-motion";
import { Send, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { askConsultant } from "./actions";
import { createClient } from "@/lib/supabase/client";

interface SourceData {
  items: Array<{ content: string }>;
  insights: Array<{ title: string; summary: string; category: string }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  sources?: SourceData;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<{
    title: string;
    content: string;
    type: string;
  } | null>(null);

  // Fetch authenticated user ID and load conversations on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user.id);
        const saved = localStorage.getItem(`pm_conversations_${user.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Conversation[];
            const sorted = parsed.sort((a, b) => b.createdAt - a.createdAt);
            setConversations(sorted);
            if (sorted.length > 0) {
              setActiveId(sorted[0].id);
            }
          } catch (e) {
            console.error("Failed to load conversations from local storage:", e);
          }
        }
      }
    });
  }, []);

  const startNewConversation = () => {
    if (!currentUser) return;
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      createdAt: Date.now(),
      messages: [],
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveId(newConv.id);
    localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(updated));
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
    localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(updated));
  };

  const parseResponse = (raw: string) => {
    const parts = raw.split("[SOURCES]");
    const mainPart = parts[0].trim();
    const sourcesText = parts[1] || "";

    let sources: SourceData = { items: [], insights: [] };
    try {
      if (sourcesText) {
        sources = JSON.parse(sourcesText.trim());
      }
    } catch (e) {
      console.error("Failed to parse sources:", e);
    }

    const mainParts = mainPart.split("[SUGGESTIONS]");
    const content = mainParts[0].trim();
    const suggestionsText = mainParts[1] || "";
    const suggestions = suggestionsText
      .split("\n")
      .map(line => line.replace(/^-\s*/, "").trim())
      .filter(line => line.length > 0)
      .slice(0, 3);

    return { content, suggestions, sources };
  };

  const handleSend = async (overrideInput?: string) => {
    const trimmedInput = (overrideInput ?? input).trim();
    if (!trimmedInput || isSending || !currentUser) return;

    let currentConvId = activeId;
    let updatedConversations = [...conversations];

    // If no conversation exists or is active, spin up a new one
    if (!currentConvId) {
      const newId = crypto.randomUUID();
      const newConv: Conversation = {
        id: newId,
        title: trimmedInput.substring(0, 30) + (trimmedInput.length > 30 ? "..." : ""),
        createdAt: Date.now(),
        messages: [{ role: "user" as const, content: trimmedInput }],
      };
      updatedConversations = [newConv, ...updatedConversations];
      currentConvId = newId;
      setConversations(updatedConversations);
      setActiveId(newId);
      setInput("");
      setIsSending(true);

      try {
        const response = await askConsultant(trimmedInput, []);
        const { content, suggestions, sources } = parseResponse(response);
        
        const finalized = updatedConversations.map(c => {
          if (c.id === newId) {
            return {
              ...c,
              messages: [...c.messages, { role: "assistant" as const, content, suggestions, sources }],
            };
          }
          return c;
        });
        setConversations(finalized);
        localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(finalized));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSending(false);
      }
      return;
    }

    const activeConv = updatedConversations.find(c => c.id === currentConvId);
    if (!activeConv) return;

    const userMessage = { role: "user" as const, content: trimmedInput };
    
    // Clear out suggestion buttons and citations of previous assistant messages to keep the thread tidy
    const cleanedHistory = activeConv.messages.map(m => {
      if (m.role === "assistant") {
        return { ...m, suggestions: [], sources: { items: [], insights: [] } };
      }
      return m;
    });

    const updatedMessages = [...cleanedHistory, userMessage];

    const nextConversations = updatedConversations.map(c => {
      if (c.id === currentConvId) {
        const updatedTitle = c.title === "New Conversation"
          ? (trimmedInput.substring(0, 30) + (trimmedInput.length > 30 ? "..." : ""))
          : c.title;
        return {
          ...c,
          title: updatedTitle,
          messages: updatedMessages,
        };
      }
      return c;
    });

    setConversations(nextConversations);
    localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(nextConversations));
    setInput("");
    setIsSending(true);

    try {
      const response = await askConsultant(trimmedInput, cleanedHistory);
      const { content, suggestions, sources } = parseResponse(response);
      
      const finalConversations = nextConversations.map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            messages: [...updatedMessages, { role: "assistant" as const, content, suggestions, sources }],
          };
        }
        return c;
      });
      setConversations(finalConversations);
      localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(finalConversations));
    } catch (error) {
      console.error("Error asking consultant:", error);
      const finalConversations = nextConversations.map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            messages: [
              ...updatedMessages,
              { role: "assistant" as const, content: "Sorry, I encountered an issue retrieving an answer. Please retry." },
            ],
          };
        }
        return c;
      });
      setConversations(finalConversations);
      localStorage.setItem(`pm_conversations_${currentUser}`, JSON.stringify(finalConversations));
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenCitation = (title: string, content: string, type: string) => {
    setActiveCitation({ title, content, type });
  };

  const activeConversation = conversations.find(c => c.id === activeId);

  return (
    <div className="p-8 h-[calc(100vh-120px)] flex gap-6 overflow-hidden relative">
      {/* Sidebar Conversation List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-72 flex flex-col border-2 border-[#111111] bg-[#F9F9F7] rounded-none overflow-hidden flex-shrink-0"
      >
        <div className="p-4 border-b-2 border-[#111111]">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 rounded-none bg-[#111111] px-4 py-2.5 text-sm font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {conversations.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-4">
              <p className="text-xs text-[#525252]">No conversations yet.</p>
            </div>
          ) : (
            conversations.map(c => {
              const isActive = c.id === activeId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`group flex items-center justify-between rounded-none px-3 py-3 text-sm cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#111111] text-[#F9F9F7] font-medium"
                      : "text-[#525252] hover:bg-[#E5E5E0]/50 hover:text-[#111111]"
                  }`}
                >
                  <span className="truncate pr-2 flex-1">{c.title}</span>
                  <button
                    onClick={(e) => deleteConversation(c.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-none hover:bg-[#E5E5E0]/30 transition-all ${
                      isActive ? "text-[#F9F9F7]" : "text-[#525252] hover:text-[#CC0000]"
                    }`}
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Main Conversation Window */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col border-2 border-[#111111] bg-[#F9F9F7] rounded-none overflow-hidden"
      >
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-sm">
                <MessageCircle className="h-12 w-12 text-[#525252] mx-auto opacity-50" />
                <div>
                  <h3 className="font-semibold text-[#111111] mb-2">
                    AI Product Strategy Consultant
                  </h3>
                  <p className="text-sm text-[#525252]">
                    Ask questions mapping to your parsed files and feedback metrics. Try: &quot;What are the core user complaints?&quot;
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeConversation.messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-none p-3 whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#111111] text-[#F9F9F7] shadow-sm"
                        : "bg-[#E5E5E0] text-[#111111]"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>

                  {/* RAG Source Citations */}
                  {msg.role === "assistant" && msg.sources && (msg.sources.items.length > 0 || msg.sources.insights.length > 0) && (
                    <div className="mt-3.5 w-full max-w-xs lg:max-w-md space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Sources & Citations:</p>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {msg.sources.insights.map((ins, insIdx) => (
                          <div
                            key={`ins-${insIdx}`}
                            onClick={() => handleOpenCitation(ins.title, ins.summary, `Insight (${ins.category})`)}
                            className="p-2.5 rounded-none border-2 border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0] text-left cursor-pointer transition-colors shadow-sm text-xs group"
                          >
                            <span className="font-semibold block truncate text-[#111111] group-hover:text-[#111111] transition-colors">{ins.title}</span>
                            <span className="text-[10px] text-[#111111] mt-0.5 block capitalize">{ins.category.replace("_", " ")}</span>
                          </div>
                        ))}
                        {msg.sources.items.map((item, itemIdx) => (
                          <div
                            key={`item-${itemIdx}`}
                            onClick={() => handleOpenCitation(`Feedback Entry #${itemIdx + 1}`, item.content, "Raw Customer Feedback")}
                            className="p-2.5 rounded-none border-2 border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0] text-left cursor-pointer transition-colors shadow-sm text-xs group"
                          >
                            <span className="font-semibold block truncate text-[#111111] group-hover:text-[#111111] transition-colors">{item.content}</span>
                            <span className="text-[10px] text-[#525252] mt-0.5 block">Customer Feedback</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions list */}
                  {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3.5 w-full max-w-xs lg:max-w-md">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Suggested Follow-ups:</p>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          disabled={isSending}
                          className="text-xs text-left border-2 border-[#111111] bg-[#F9F9F7] hover:bg-[#E5E5E0] text-[#111111] px-3 py-2 rounded-none transition-colors font-medium shadow-sm hover:border-primary/30 disabled:opacity-50"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-xs lg:max-w-md rounded-none p-3 bg-[#E5E5E0] text-[#525252]">
                    <p className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-[#E5E5E0]-foreground rounded-none animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-[#E5E5E0]-foreground rounded-none animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-[#E5E5E0]-foreground rounded-none animate-bounce [animation-delay:0.4s]" />
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Message Input bar */}
        <div className="border-t-2 border-[#111111] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={isSending ? "AI is processing query context..." : "Ask a question..."}
              value={input}
              disabled={isSending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-none border-2 border-[#111111] bg-[#F9F9F7] px-4 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending || !input.trim()}
              className="rounded-none bg-[#111111] px-4 py-2 text-[#F9F9F7] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Citation Detail Overlay Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F9F7]/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#111111] font-bold">{activeCitation.type}</span>
                <h3 className="text-lg font-bold text-[#111111] mt-1 leading-snug">{activeCitation.title}</h3>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-[#525252] hover:text-[#111111] text-sm font-semibold transition-colors p-1"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-[#525252] whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto pr-2 border-y border-[#111111] py-4">
              {activeCitation.content}
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveCitation(null)}
                className="rounded-none bg-[#111111] px-4 py-2 text-sm font-medium text-[#F9F9F7] hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
