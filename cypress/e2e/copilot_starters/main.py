import chainlit as cl


@cl.set_starters
async def set_starters():
    return [
        cl.Starter(
            label="Hello Copilot", message="Say hello to the copilot!", icon="👋"
        ),
        cl.Starter(
            label="Ask Question", message="What can you help me with?", icon="❓"
        ),
        cl.Starter(
            label="Generate Code",
            message="Can you help me write some Python code?",
            icon="💻",
        ),
        cl.Starter(
            label="Explain Concept",
            message="Explain how machine learning works",
            icon="🧠",
        ),
    ]


@cl.on_chat_start
async def on_chat_start():
    if cl.context.session.client_type == "copilot":
        print("[Debug] Copilot session started")
        await cl.Message(content="Hi from copilot! Choose a starter to begin.").send()
    else:
        print("[Debug] Regular session started")
        await cl.Message(content="Hello! This is a test app for starters.").send()


@cl.on_message
async def on_message(msg: cl.Message):
    client_type = cl.context.session.client_type
    print(f"[Debug] Message received from {client_type}: {msg.content}")

    if client_type == "copilot":
        await cl.Message(content=f"Copilot received: {msg.content}").send()
    else:
        await cl.Message(content=f"Regular app received: {msg.content}").send()
