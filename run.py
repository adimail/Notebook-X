import signal
import tornado.ioloop
import asyncio
from server import make_app


def shutdown(loop):
    print("\nShutting down Notebook X server...")
    loop.stop()


INTRO = """
  _   _    ___    _____   _____   ____     ___     ___    _  __   __  __
 | \ | |  / _ \  |_   _| | ____| | __ )   / _ \   / _ \  | |/ /   \ \/ /
 |  \| | | | | |   | |   |  _|   |  _ \  | | | | | | | | | ' /     \  /
 | |\  | | |_| |   | |   | |___  | |_) | | |_| | | |_| | | . \     /  \\
 |_| \_|  \___/    |_|   |_____| |____/   \___/   \___/  |_|\_\   /_/\_\\



"""

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    print(INTRO)
    print("Notebook-X is running at http://localhost:8888")

    loop = asyncio.get_event_loop()

    signal.signal(signal.SIGINT, lambda sig, frame: shutdown(loop))
    signal.signal(signal.SIGTERM, lambda sig, frame: shutdown(loop))

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        shutdown(loop)
