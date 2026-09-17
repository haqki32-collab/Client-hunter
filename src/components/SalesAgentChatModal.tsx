import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  Flame,
  CheckCircle2,
  HelpCircle,
  Clock,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { Lead, ChatMessage, AppSettings } from '../types.ts';

interface SalesAgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  settings: AppSettings;
  onLeadUpdated: () => void;
}

export const SalesAgentChatModal: React.FC<SalesAgentChatModalProps> = ({
  isOpen,
  onClose,
  lead,
  settings,
  onLeadUpdated,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>(lead?.salesConversation || []);

  // Sync if lead changes
  React.useEffect(() => {
    if (lead?.salesConversation) {
      setConversation(lead.salesConversation);
    } else {
      setConversation([]);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    setIsLoading(true);
    // Optimistically show client message
    const tempClientMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: 'client',
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setConversation((prev) => [...prev, tempClientMsg]);
    setInputMessage('');

    try {
      const res = await fetch('/api/sales-agent/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          clientMessage: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.conversation) {
        setConversation(data.conversation);
        onLeadUpdated();
      } else {
        alert(data.error || 'Failed to get sales response');
      }
    } catch (err) {
      alert('Error communicating with Sales Agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScenario = async (scenario: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sales-agent/simulate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, scenario }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        setConversation(data.conversation);
        onLeadUpdated();
      }
    } catch (err) {
      alert('Simulation error');
    } finally {
      setIsLoading(false);
    }
  };

  const isHot = lead.outreachStatus === 'ready_to_buy' || lead.isReadyToBuy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{lead.businessName}</h3>
                {isHot && (
                  <span className="flex items-center gap-1 text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    <Flame className="h-3 w-3 fill-current" />
                    READY TO BUY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Sales AI Agent representing {settings.developerName} ({settings.businessName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Simulations Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Test Client Inbound Questions (Salesman Simulation):
          </span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => handleSimulateScenario('pricing')}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              <DollarSign className="h-3 w-3 text-emerald-600" />
              "How much do you charge?"
            </button>
            <button
              onClick={() => handleSimulateScenario('portfolio')}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              <Briefcase className="h-3 w-3 text-indigo-600" />
              "Show me portfolio examples"
            </button>
            <button
              onClick={() => handleSimulateScenario('ready_to_buy')}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50"
            >
              <Flame className="h-3 w-3 fill-current" />
              "We're ready to start! What's next?"
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/60 min-h-[280px]">
          {conversation.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <Bot className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              No messages yet. Send an offer or click one of the questions above to test the sales agent!
            </div>
          ) : (
            conversation.map((msg) => {
              const isAgent = msg.sender === 'sales_agent' || msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAgent ? 'justify-end' : 'justify-start'}`}
                >
                  {!isAgent && (
                    <div className="h-7 w-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                      C
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-xs space-y-1 ${
                      isAgent
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70">
                      <span className="font-bold">
                        {isAgent ? `${settings.developerName} (Sales AI)` : lead.businessName}
                      </span>
                      {msg.intent && (
                        <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                          {msg.intent}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>

                  {isAgent && (
                    <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                      A
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Sparkles className="h-4 w-4 animate-spin text-indigo-600" />
              Sales agent is typing professional response...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Simulate client message from ${lead.businessName}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
