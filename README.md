# SecureX-AI Architecture Overview

SecureX-AI is a full-stack application centered around a secure, pseudonymized document RAG (Retrieval-Augmented Generation) pipeline with strict Role-Based Access Control (RBAC).

## 1. Frontend (`pa-frontend`)
- **Technology Stack**: Next.js (React), TailwindCSS, shadcn/ui, Zustand, React Query.
- **Role**: The user-facing client. It provides the dashboard, document management interfaces, and the chatbot UI for querying documents.
- **Interactions**: 
  - Communicates with the **NestJS Backend** for authentication, user/team management, and document metadata.
  - Communicates with the **Python Backend** (often via the NestJS Gateway) for AI-driven chatbot queries and document retrieval.

## 2. Core Backend API (`pa-backend`)
- **Technology Stack**: NestJS (Node.js/TypeScript), Prisma ORM.
- **Database**: **PostgreSQL**
- **Role**: The main API Gateway and business logic server. It handles authentication (JWT/Passport), tenant management (companies/teams), and RBAC (roles & permissions). It also manages metadata for uploaded files (using Cloudinary/AWS S3).
- **Interactions**: 
  - Reads/Writes relational data to **PostgreSQL** (Users, Teams, Sessions, Document Access Rules).
  - Acts as a bridge, forwarding document files and authorization contexts to the **Python Backend** for AI processing.

## 3. Document Processing & AI Pipeline (`python-backend`)
- **Technology Stack**: Flask (Python), PyMuPDF, Spacy, Faker, Featherless AI.
- **Database**: **MongoDB**
- **Role**: The AI engine. It handles document ingestion, parses text, applies data pseudonymization (using Spacy & Faker for PII), creates embeddings, and executes LLM-powered RAG queries.
- **Interactions**: 
  - Reads/Writes unstructured data, vectors, and chat history to **MongoDB**.
  - Receives processing requests from the **NestJS Backend**.
  - Responds to LLM chatbot queries from the **Frontend** based on the structured patient/document data.

## System Interaction Flow (For Diagram)
1. **User Request**: User uploads a document via the **Next.js Frontend**.
2. **Access & Metadata**: Request hits the **NestJS Backend**. It verifies the user's role, saves document metadata in **PostgreSQL**, and uploads the file to storage.
3. **AI Ingestion**: **NestJS Backend** triggers the **Flask Python Backend** to process the document.
4. **Data Masking & Vectorization**: The **Python Backend** extracts text, masks PII (pseudonymization), and stores the processed chunks/embeddings in **MongoDB**.
5. **Chat/RAG Query**: The user asks a question via the **Frontend**. The request is authorized by **NestJS**, passed to the **Python Backend**, which searches **MongoDB** and generates an answer using an LLM (Featherless AI), returning it to the user.
