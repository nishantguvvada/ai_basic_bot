import { useState } from 'react';
import axios from 'axios';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const systemMessage = {
  "role": "system", "content": "Explain things like you're talking to a software professional with only 1 years of experience. Keep the answer within 50 words limit."
}

function App() {

  const [messages, setMessages] = useState([
    {
      sender: "Virtual Assistant",
      message: "Hi, I am a basic-bot! I'm here to give you a sneak peak of a basic chatbot!",
      direction: 0
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (message) => {
    const newMessage = {
      sender: "User",
      message: message,
    }

    const newMessages = [...messages, newMessage]
    setMessages(newMessages); // adding the user provided message to the messages state array

    setIsTyping(true);
    await sendMessageToGpt(newMessages); // formats the input message into gpt readable and queries the gpt model
  };

  const sendMessageToGpt = async (chatMessages) => {
    try {
      let apiMessages = chatMessages.map((messageObject) => {
        let role = "";
        if (messageObject.sender === "Virtual Assistant") {
          role = "assistant";
        } else {
          role = "user";
        }
        return { role: role, content: messageObject.message}
      });
  
      const apiBody = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [systemMessage, ...apiMessages]
      });
  
      const session = await axios.post("https://api.aimlapi.com/chat/completions", apiBody, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`
        }
      });
  
      setIsTyping(false);
      // console.log("session",session.data.choices[0].message);
      setMessages([...chatMessages, {
        message: session.data.choices[0].message.content,
        sender: "Virtual Assistant",
        direction: 0
      }])
    } catch(err) {
      alert("Sorry, GPT API limit exhausted");
      console.log(err);
    }


  };

  return (
    <>
      <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%", // or any specific width
            height: "80vh", // or any specific height
            padding: "20px 0"
        }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={isTyping ? <TypingIndicator content="basic bot is fetching info" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message}/>
              })}
            </MessageList>
            <MessageInput placeholder='Type your questions here!' onSend={sendMessage}/>
          </ChatContainer>
        </MainContainer>
      </div>
    </>
  )
}

export default App
