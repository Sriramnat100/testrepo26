import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MessageSquare, Send, ChevronUp, ChevronDown, Sparkles, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const suggestedPrompts = [
  { text: "Summarize my last inspection", icon: Sparkles },
  { text: "Show top recurring failures", icon: BarChart3 },
  { text: "Generate a chart of failures by category", icon: BarChart3 },
];

export const ChatDock = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi Sriram! I'm your Cat Inspect AI assistant. I can help you analyze your inspections, identify patterns, and generate reports. What would you like to know?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: text,
        session_id: "inspector-session",
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response,
        chart_data: response.data.chart_data,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full lg:w-2/3 z-40 p-4 pointer-events-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card 
          className="bg-white border-gray-200 shadow-lg pointer-events-auto max-w-2xl"
          data-testid="chat-dock"
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F9A825] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-900" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    AI Assistant
                  </CardTitle>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Online
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-64 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5",
                          message.role === "user"
                            ? "bg-[#F9A825] text-gray-900"
                            : "bg-gray-100 text-gray-800"
                        )}
                        data-testid={`chat-message-${index}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.chart_data && (
                          <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              {message.chart_data.title}
                            </p>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={message.chart_data.data}>
                                  <XAxis 
                                    dataKey="category" 
                                    tick={{ fontSize: 10 }} 
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis hide />
                                  <Tooltip />
                                  <Bar 
                                    dataKey="count" 
                                    fill="#F9A825" 
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggested Prompts */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs border-gray-200 hover:bg-[#F9A825]/10 hover:border-[#F9A825] flex-shrink-0"
                      onClick={() => handlePromptClick(prompt.text)}
                      disabled={isLoading}
                      data-testid={`prompt-chip-${index}`}
                    >
                      <prompt.icon className="w-3 h-3 mr-1.5" />
                      {prompt.text}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your inspections..."
                    className="flex-1 bg-gray-50 border-gray-200"
                    disabled={isLoading}
                    data-testid="chat-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-[#F9A825] hover:bg-[#F57F17] text-gray-900"
                    disabled={isLoading || !inputValue.trim()}
                    data-testid="chat-send-btn"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default ChatDock;
