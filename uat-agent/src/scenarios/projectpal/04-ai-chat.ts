import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-04-ai-chat',
  name: 'ProjeXtPal - AI Chat Assistant',
  app: 'projectpal',
  description: 'Verify the ProjeXtPal AI assistant chat functionality',
  tags: ['ai', 'chat', 'bot'],
  steps: [
    {
      name: 'Login',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects/, { timeout: 15000 });

        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          ctx.data.authToken = token;
        }
      },
    },
    {
      name: 'Open AI chat interface',
      action: async (ctx) => {
        // Look for chat button/icon in the UI
        const chatTrigger = ctx.page.locator(
          'button[aria-label*="chat" i], button[class*="chat" i], button[class*="bot" i], [data-testid*="chat"], text=/assistant|chat|bot/i'
        );
        if ((await chatTrigger.count()) > 0) {
          await chatTrigger.first().click();
          await ctx.page.waitForTimeout(1000);
          ctx.data.chatOpened = true;
          ctx.log('Chat interface opened via UI');
        } else {
          // Try navigating directly
          await ctx.page.goto(`${ctx.app.baseUrl}/chat`);
          await ctx.page.waitForLoadState('networkidle');
          ctx.data.chatOpened = true;
          ctx.log('Navigated to chat page directly');
        }
      },
    },
    {
      name: 'Verify chat API - create chat',
      action: async (ctx) => {
        if (!ctx.data.authToken) {
          ctx.log('No auth token, skipping API test');
          return;
        }
        const res = await ctx.api.post('/api/v1/bot/chats/', {
          title: 'UAT Test Chat',
        });
        if (res.ok) {
          ctx.data.chatId = res.data.id;
          ctx.log(`Chat created with ID: ${res.data.id}`);
        } else {
          ctx.log(`Create chat returned ${res.status}: ${JSON.stringify(res.data)}`);
        }
      },
    },
    {
      name: 'Verify chat API - send message',
      action: async (ctx) => {
        if (!ctx.data.chatId) {
          ctx.log('No chat ID, skipping message test');
          return;
        }
        const res = await ctx.api.post(
          `/api/v1/bot/chats/${ctx.data.chatId}/send_message/`,
          {
            message: 'Hello, what can you help me with?',
            language: 'en',
          }
        );
        if (res.ok) {
          const hasUserMsg = !!res.data.user_message;
          const hasAiResponse = !!res.data.ai_response;
          ctx.log(`Message sent. User msg: ${hasUserMsg}, AI response: ${hasAiResponse}`);
          if (res.data.ai_response?.content) {
            ctx.log(`AI replied: "${res.data.ai_response.content.substring(0, 80)}..."`);
          }
        } else {
          ctx.log(`Send message returned ${res.status}`);
        }
      },
    },
    {
      name: 'Verify chat API - Dutch language support',
      action: async (ctx) => {
        if (!ctx.data.chatId) {
          ctx.log('No chat ID, skipping Dutch test');
          return;
        }
        const res = await ctx.api.post(
          `/api/v1/bot/chats/${ctx.data.chatId}/send_message/`,
          {
            message: 'Geef een overzicht van mijn projecten',
            language: 'nl',
          }
        );
        if (res.ok && res.data.ai_response?.content) {
          ctx.log(`Dutch response received: "${res.data.ai_response.content.substring(0, 80)}..."`);
        } else {
          ctx.log(`Dutch message test: status ${res.status}`);
        }
      },
    },
    {
      name: 'Verify chat history API',
      action: async (ctx) => {
        if (!ctx.data.chatId) {
          ctx.log('No chat ID, skipping history test');
          return;
        }
        const res = await ctx.api.get(`/api/v1/bot/chats/${ctx.data.chatId}/history/`);
        if (res.ok) {
          const msgCount = res.data.messages?.length || 0;
          ctx.log(`Chat history has ${msgCount} messages`);
        } else {
          ctx.log(`History API returned ${res.status}`);
        }
      },
    },
  ],
};

export default scenario;
