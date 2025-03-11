from chainlit.context import context
from chainlit.user_session import user_session


async def send_mode_to_frontend(mode: str):
    """
    Send the current mode to the frontend.
    This allows the frontend to adapt its UI based on the mode.
    """
    if hasattr(context, "emitter") and hasattr(context.emitter, "emit"):
        # Store the mode in the user session to persist it
        user_session.set("copilot_mode", mode)
        await context.emitter.emit("copilot_mode", {"mode": mode})


async def enable_mathpractice():
    """
    Enable math practice mode.
    This hides the microphone and upload buttons in the frontend UI.
    """
    await send_mode_to_frontend("mathpractice")


# Add a function to check the current mode
async def get_current_mode():
    """
    Get the current copilot mode from the user session.
    """
    return user_session.get("copilot_mode", None)
