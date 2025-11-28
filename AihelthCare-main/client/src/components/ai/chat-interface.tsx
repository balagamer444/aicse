import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Expand, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  message: string;
  isFromAI: boolean;
  isFromDoctor: boolean;
  createdAt: string;
  metadata?: any;
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { sendChatMessage, lastMessage, isConnected } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'chat_message') {
        setMessages(prev => [...prev, lastMessage.data]);
      } else if (lastMessage.type === 'ai_response') {
        setMessages(prev => [...prev, lastMessage.data]);
        setIsTyping(false);
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'assistant', content: lastMessage.data.message }
        ]);
      }
    }
  }, [lastMessage]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    const newMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isFromAI: false,
      isFromDoctor: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: inputMessage }];
    setConversationHistory(newHistory);
    
    // Send message via WebSocket
    sendChatMessage(inputMessage, undefined, newHistory);
    setInputMessage("");
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskLevel = (metadata: any) => {
    if (!metadata?.emergencyLevel) return null;
    
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-red-100 text-red-700",
    };

    return (
      <Badge className={colors[metadata.emergencyLevel as keyof typeof colors]}>
        {metadata.emergencyLevel} Risk
      </Badge>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Health Assistant</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}></div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? "Online • Ready to help" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Low Risk</Badge>
            <Button variant="ghost" size="sm" data-testid="button-expand-chat">
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" data-testid="chat-messages">
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-sm" />
              </div>
              <div className="bg-muted rounded-lg p-4 max-w-md">
                <p className="text-sm">Hello! I'm your AI Health Assistant. I'm here to help analyze your symptoms and provide preliminary health guidance. How are you feeling today?</p>
                <span className="text-xs text-muted-foreground mt-2 block">Just now</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                !message.isFromAI && !message.isFromDoctor && "justify-end"
              )}
            >
              {(message.isFromAI || message.isFromDoctor) && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-sm" />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-lg p-4 max-w-md",
                  message.isFromAI || message.isFromDoctor
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm">{message.message}</p>
                
                {message.metadata && (
                  <div className="mt-3 space-y-2">
                    {message.metadata.predictions && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Analysis:</p>
                        {message.metadata.predictions.slice(0, 3).map((pred: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span>{pred.disease}</span>
                            <Badge variant="outline" className="text-xs">
                              {pred.confidence}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.metadata.recommendations && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                        <strong>Recommendation:</strong> {message.metadata.recommendations}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  {message.metadata && getRiskLevel(message.metadata)}
                </div>
              </div>

              {!message.isFromAI && !message.isFromDoctor && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white text-sm" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-sm" />
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-dot"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Describe your symptoms or ask a health question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI responses are for informational purposes only and do not replace professional medical advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
