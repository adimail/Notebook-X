import signal
import tornado.ioloop
import asyncio
import logging
from server import make_app

LOG_FILE = "notebookx.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="w"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


def shutdown(loop):
    logger.info("Shutting down Notebook X server...")
    loop.stop()


INTRO = """
  _   _    ___    _____   _____   ____     ___     ___    _  __   __  __
 | \ | |  / _ \  |_   _| | ____| | __ )   / _ \   / _ \  | |/ /   \ \/ /
 |  \| | | | | |   | |   |  _|   |  _ \  | | | | | | | | | ' /     \  /
 | |\  | | |_| |   | |   | |___  | |_) | | |_| | | |_| | | . \     /  \\
 |_| \_|  \___/    |_|   |_____| |____/   \___/   \___/  |_|\_\   /_/\_\\

"""


def main():
    app = make_app()
    app.listen(8888)

    logger.info("\n" + INTRO)
    logger.info("Notebook-X is running at http://localhost:8888")

    loop = asyncio.get_event_loop()

    signal.signal(signal.SIGINT, lambda sig, frame: shutdown(loop))
    signal.signal(signal.SIGTERM, lambda sig, frame: shutdown(loop))

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        shutdown(loop)


if __name__ == "__main__":
    main()
