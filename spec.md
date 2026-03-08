# Jigyansa - AI Companion App

## Current State
New project, nothing built yet.

## Requested Changes (Diff)

### Add
- AI companion chat app named "Jigyansa"
- Female persona: empathetic, funny, caring, speaks in Hinglish (Hindi + English mix)
- User can enter their name on first visit for personalized experience
- Chat interface with message input and send button
- Conversation history saved (persisted in backend)
- Mobile-responsive design
- Jigyansa's personality: no robotic tone, natural friendly responses, uses Hinglish

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend
- Store user profile: name, created_at
- Store conversation messages: sender (user/jigyansa), text, timestamp
- APIs:
  - setUserName(name: Text) -> ()
  - getUserName() -> ?Text
  - sendMessage(userMessage: Text) -> Text (returns Jigyansa's reply)
  - getConversationHistory() -> [Message]
  - clearHistory() -> ()
- Jigyansa's reply logic: rule-based empathetic Hinglish responses based on keywords (happy, sad, angry, greeting, etc.)

### Frontend
- Welcome/onboarding screen: user enters their name
- Main chat screen:
  - Chat bubble UI (user messages right, Jigyansa messages left)
  - Jigyansa avatar/icon
  - Message input at bottom with send button
  - Conversation history displayed
  - Mobile-first responsive layout
- Persist user name, show personalized greeting from Jigyansa
