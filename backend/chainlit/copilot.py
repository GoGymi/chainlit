from chainlit.context import context


async def send_mode_to_frontend(mode: str):
    """
    Send the current mode to the frontend.
    This allows the frontend to adapt its UI based on the mode.
    """
    if hasattr(context, "emitter") and hasattr(context.emitter, "emit"):
        await context.emitter.emit("copilot_mode", {"mode": mode})


async def enable_mathpractice():
    """
    Enable math practice mode.
    This hides the microphone and upload buttons in the frontend UI.
    """
    await send_mode_to_frontend("mathpractice")
