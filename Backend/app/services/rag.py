import chromadb
from app.config import get_settings

settings = get_settings()


class RAGService:
    def __init__(self):
        self.client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
        )
        self.collection = self.client.get_or_create_collection(
            name="medical_knowledge",
            metadata={"hnsw:space": "cosine"},
        )

    def add_document(self, doc_id: str, text: str, metadata: dict | None = None):
        self.collection.add(ids=[doc_id], documents=[text], metadatas=[metadata or {}])

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        results = self.collection.query(query_texts=[query], n_results=n_results)
        output = []
        for i, doc in enumerate(results["documents"][0]):
            output.append({
                "content": doc,
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "distance": results["distances"][0][i] if results["distances"] else 0,
            })
        return output

    def delete_document(self, doc_id: str):
        self.collection.delete(ids=[doc_id])


rag_service = RAGService()
