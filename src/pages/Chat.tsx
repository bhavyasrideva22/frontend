import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

const Chat = () => {
  const STORAGE_KEY = 'chat_conversations_v1';
  const seed: Conversation = {
    id: `seed-${Date.now()}`,
    title: 'New Conversation',
    lastMessage: '',
    timestamp: 'Just now',
    messages: [],
  };
  const [conversations, setConversations] = useState<Conversation[]>([seed]);
  const [activeConversationId, setActiveConversationId] = useState<string>(seed.id);
  const [isTyping, setIsTyping] = useState(false);

  // Load conversations from localStorage (or seed empty)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: Conversation[] = JSON.parse(raw).map((c: any) => ({
          ...c,
          messages: (c.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        setConversations(stored);
        if (stored[0]) setActiveConversationId(stored[0].id);
      } else {
        const first: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          lastMessage: '',
          timestamp: 'Just now',
          messages: [],
        };
        setConversations([first]);
        setActiveConversationId(first.id);
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleSendMessage = async (messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update the conversation with the new message
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== activeConversationId) return conv;
        const isFirstMessage = (conv.messages?.length || 0) === 0;
        const derivedTitle = isFirstMessage
          ? messageText.trim().slice(0, 40) || 'New Conversation'
          : conv.title;
        return {
          ...conv,
          title: derivedTitle,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          timestamp: 'Just now',
        };
      })
    );

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(messageText),
        sender: 'assistant',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, botResponse],
                lastMessage: botResponse.text.substring(0, 50) + '...',
                timestamp: 'Just now',
              }
            : conv
        )
      );
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (userMessage: string): string => {
    // Simple response generation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('hey guide me') || message === 'guide me' || message.includes('help me') || message.includes('start')) {
      return `Great! I can be your AI career mentor. Share your profile links so I can tailor guidance to you:

• LinkedIn URL
• GitHub URL
• CodeChef URL

Once I have these, I'll analyze your background and suggest the best next steps, roles to target, and a learning roadmap.`;
    }

    if (message.includes('github') || message.includes('profile')) {
      return `I'd love to analyze your GitHub profile! Please share your GitHub username or the direct link to your profile. I'll examine:

• **Repository Quality**: Project complexity, code organization, and documentation
• **Programming Languages**: Your most-used languages and frameworks
• **Contribution Patterns**: Consistency, collaboration, and open-source involvement
• **Project Diversity**: Full-stack capabilities, specializations, and interests

Once I review your profile, I can provide:
✅ Personalized career path recommendations
✅ Skill gap analysis and learning priorities
✅ Industry-specific opportunities
✅ Step-by-step roadmap for advancement

What's your GitHub username?`;
    }
    
    if (message.includes('linkedin')) {
      return `Great! LinkedIn analysis provides valuable insights into your professional journey. I can help you optimize your profile and identify career opportunities based on:

• **Professional Experience**: Roles, responsibilities, and career progression
• **Skills & Endorsements**: Technical and soft skills validation
• **Network Analysis**: Industry connections and potential mentors
• **Content Engagement**: Thought leadership and industry involvement

Please share your LinkedIn profile URL, and I'll provide recommendations for:
🎯 Profile optimization strategies
🎯 Networking opportunities in your field
🎯 Career advancement pathways
🎯 Skill development priorities

What's your LinkedIn profile?`;
    }
    
    if (message.includes('roadmap') || message.includes('learn')) {
      return `I'll create a personalized learning roadmap for you! To provide the most relevant recommendations, I'd like to understand:

🎯 **Current Skill Level**: Beginner, intermediate, or advanced?
🎯 **Target Role**: What position are you aiming for?
🎯 **Timeline**: When do you want to achieve your goal?
🎯 **Learning Style**: Prefer courses, projects, or certifications?

Based on your goals, I can create a roadmap including:
📚 **Structured Learning Path**: Courses and resources
🛠️ **Hands-on Projects**: Portfolio-worthy applications  
🏆 **Certifications**: Industry-recognized credentials
⏰ **Timeline**: Realistic milestones and deadlines

What specific technology or role are you targeting?`;
    }

    return `I'm here to help guide your career journey! I can assist with:

🚀 **Profile Analysis**: GitHub, LinkedIn, and CodeChef review
📊 **Career Planning**: Personalized roadmaps and goal setting  
📚 **Skill Development**: Learning resources and project ideas
💼 **Job Preparation**: Interview tips and portfolio guidance

What specific aspect of your career would you like to focus on today? Feel free to share any profiles or ask about particular technologies or roles you're interested in!`;
  };

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: 'Just now',
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      if (remaining[0]) {
        setActiveConversationId(remaining[0].id);
      } else {
        const first: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          lastMessage: '',
          timestamp: 'Just now',
          messages: [],
        };
        setConversations([first]);
        setActiveConversationId(first.id);
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />

        <main className="flex-1 flex flex-col">
          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Chat;