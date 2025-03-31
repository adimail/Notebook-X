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

INTRO = """
  _   _    ___    _____   _____   ____     ___     ___    _  __   __  __
 | \ | |  / _ \  |_   _| | ____| | __ )   / _ \   / _ \  | |/ /   \ \/ /
 |  \| | | | | |   | |   |  _|   |  _ \  | | | | | | | | | ' /     \  /
 | |\  | | |_| |   | |   | |___  | |_) | | |_| | | |_| | | . \     /  \\
 |_| \_|  \___/    |_|   |_____| |____/   \___/   \___/  |_|\_\   /_/\_\\

"""


def shutdown(loop, kernel_manager):
    """Shutdown the server and all running kernels."""
    logger.info("Shutting down Notebook X server...")

    active_kernels = list(kernel_manager.kernels.keys())
    for kernel_id in active_kernels:
        logger.info(f"Shutting down kernel {kernel_id}")
        kernel_manager.shutdown_kernel(kernel_id)

    loop.stop()


def main():
    app = make_app()
    app.listen(8197)

    logger.info("\n" + INTRO)
    logger.info("Notebook-X is running at http://localhost:8197")

    loop = asyncio.get_event_loop()

    kernel_manager = app.settings["kernel_manager"]

    signal.signal(signal.SIGINT, lambda sig, frame: shutdown(loop, kernel_manager))
    signal.signal(signal.SIGTERM, lambda sig, frame: shutdown(loop, kernel_manager))

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        shutdown(loop, kernel_manager)


if __name__ == "__main__":
    main()
