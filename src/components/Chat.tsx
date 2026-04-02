import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Message, Profile, Match } from '../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';

type ChatProps = {
  match: Match & { profile: Profile };
  onBack: () => void;
};

export function Chat({ match, onBack }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`match:${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await supabase.from('messages').insert({
        match_id: match.id,
        sender_id: user.id,
        content: messageText,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(messageText);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white p-4 flex items-center gap-4 shadow-md">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/20 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden">
            {match.profile.photo_url ? (
              <img
                src={match.profile.photo_url}
                alt={match.profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                {match.profile.full_name[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{match.profile.full_name}</h3>
            <p className="text-sm opacity-90">{match.profile.university}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Say hello!</p>
              <p className="text-sm">Start the conversation</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-rose-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id ? 'text-rose-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
