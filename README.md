# 💰 ChatGloom — Singapore Finance AI Assistant

**ChatGloom** is an intelligent web-based assistant designed to help Singaporeans navigate personal and national finance topics effortlessly. It uses [Perplexity AI’s API](https://www.perplexity.ai/) under the hood and is optimised through prompt engineering techniques to return highly relevant, trustworthy responses—always with cited sources.

---

## 🚀 Features

- **Singapore-Focused Finance Queries**  
  Tailored to understand and respond to queries about CPF, taxes, housing grants, GST, investments, budgeting, and more.

- **Powered by Perplexity API**  
  Uses Perplexity's retrieval-augmented generation (RAG) pipeline to ensure information is sourced, recent, and factually grounded.

- **Prompt Engineering for Relevance**  
  A carefully constructed system prompt optimises response accuracy and relevance by:
  - Encouraging Singapore-specific context recognition  
  - Filtering out generic or non-actionable content  
  - Always returning sources in the form of URLs or documents

- **Modern Frontend Experience**  
  Lightweight and responsive UI built for a seamless, mobile-first experience.

---

## 🛠️ Technical Architecture

### ⚙️ Backend

- **API Integration**
  - Communicates with Perplexity’s public or partner API (authenticated endpoint) to fetch answers.
  - Query wrapping: raw user input is programmatically rephrased with system-level instructions to bias answers toward local financial relevance.
  
- **Prompt Engineering**
  - A static system prompt is appended to each user query.
  - The prompt includes meta-directives like:
    - “Limit scope to Singapore’s financial ecosystem”
    - “Always include source links”
    - “Avoid speculative or general financial advice”
  
- **Error Handling**
  - Graceful fallbacks for no response or empty result sets  
  - Caching of frequent queries to minimise token usage and reduce latency

### 🖥️ Frontend

- Built with **Next.js** (or specify your stack)  
- Uses **Tailwind CSS** for UI styling  
- Minimalist chat interface with:
  - Input field  
  - Loading animation  
  - Scrollable chat history  
  - Link previews for cited sources

---

## 🧠 Why Perplexity?

Perplexity AI provides high-quality, up-to-date responses using web search, citations, and RAG. This makes it especially suitable for:
- Real-time financial policy updates  
- Reference to government portals (e.g. IRAS, CPF Board, HDB)  
- Investment or taxation trends based on current laws

---

## 📦 Project Structure

```bash
/
├── pages/               # Next.js page routes
├── components/          # UI components like ChatBox, MessageBubble
├── utils/               # API and prompt utilities
├── styles/              # Tailwind configuration
├── public/              # Static assets
└── README.md
