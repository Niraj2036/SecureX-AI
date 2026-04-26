import os
import time
import queue
import threading
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

EMBEDDING_ENDPOINT = os.getenv("EMBEDDING_ENDPOINT", "")
BATCH_SIZE = 32
MAX_RETRIES = 3
RETRY_DELAY = 2.0
RATE_LIMIT_DELAY = 0.5


class EmbeddingQueue:

    def __init__(self):
        self._queue = queue.Queue()
        self._results = {}
        self._lock = threading.Lock()
        self._worker_thread = None
        self._running = False

    def start(self):
        if self._running:
            return
        self._running = True
        self._worker_thread = threading.Thread(target=self._worker, daemon=True)
        self._worker_thread.start()

    def stop(self):
        self._running = False
        if self._worker_thread:
            self._worker_thread.join(timeout=30)

    def enqueue(self, request_id: str, texts: list):
        self._queue.put((request_id, texts))

    def get_result(self, request_id: str, timeout: float = 300.0) -> list:
        start = time.time()
        while time.time() - start < timeout:
            with self._lock:
                if request_id in self._results:
                    result = self._results.pop(request_id)
                    if isinstance(result, Exception):
                        raise result
                    return result
            time.sleep(0.1)
        raise TimeoutError(f"Embedding request {request_id} timed out after {timeout}s")

    def _worker(self):
        while self._running:
            batch_items = []
            try:
                item = self._queue.get(timeout=1.0)
                batch_items.append(item)
            except queue.Empty:
                continue

            while len(batch_items) < BATCH_SIZE:
                try:
                    item = self._queue.get_nowait()
                    batch_items.append(item)
                except queue.Empty:
                    break

            for request_id, texts in batch_items:
                try:
                    embeddings = self._call_embedding_api(texts)
                    with self._lock:
                        self._results[request_id] = embeddings
                except Exception as e:
                    logger.error(f"Embedding failed for {request_id}: {e}")
                    with self._lock:
                        self._results[request_id] = e

                time.sleep(RATE_LIMIT_DELAY)

    def _call_embedding_api(self, texts: list) -> list:
        if not EMBEDDING_ENDPOINT:
            raise RuntimeError("EMBEDDING_ENDPOINT not set in environment")

        for attempt in range(MAX_RETRIES):
            try:
                response = requests.post(
                    EMBEDDING_ENDPOINT,
                    json={"texts": texts},
                    timeout=120
                )
                response.raise_for_status()
                data = response.json()
                return data["embeddings"]
            except requests.exceptions.RequestException as e:
                if attempt < MAX_RETRIES - 1:
                    logger.warning(f"Embedding API attempt {attempt + 1} failed: {e}, retrying...")
                    time.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    raise RuntimeError(f"Embedding API failed after {MAX_RETRIES} retries: {e}")


_global_queue = None
_queue_lock = threading.Lock()


def get_embedding_queue() -> EmbeddingQueue:
    global _global_queue
    with _queue_lock:
        if _global_queue is None:
            _global_queue = EmbeddingQueue()
            _global_queue.start()
    return _global_queue


def embed_texts(texts: list, request_id: str) -> list:
    eq = get_embedding_queue()
    eq.enqueue(request_id, texts)
    return eq.get_result(request_id)
