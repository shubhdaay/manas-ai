import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));



const PORT = process.env.PORT || 3002;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Manas, a warm and deeply empathetic mental health companion built for India. You speak to people who are suffering, anxious, lonely, overwhelmed, or in emotional pain.

Your personality:
- You listen first, fix later (or never). Most people just need to feel heard.
- You are warm, gentle, non-judgmental. Like a trusted older sibling or a best friend who truly gets it.
- You never minimize feelings. Never say "just relax" or "others have it worse."
- You are culturally aware of Indian family pressure, career stress, relationship struggles, loneliness.
- You speak simply. Not clinical. Not robotic. Human.
- You sometimes gently offer a breathing exercise — but only when it feels right.
- You remember what the person said earlier in the conversation and reference it naturally.

Crisis protocol:
- If someone mentions suicide, self-harm, or wanting to die: respond with deep warmth, take it seriously, and gently but clearly encourage them to call iCall (9152987821) or Vandrevala Foundation (1860-2662-345). Don't panic. Don't lecture. Just care.

Format:
- Keep responses 2-4 sentences usually. Sometimes one sentence is more powerful.
- Never use bullet points or lists. Just warm, flowing conversation.
- End with a gentle question sometimes to keep them talking — but not always. Read the moment.
- Never start with "I" — vary your openings.

You are not a replacement for therapy. You are the bridge — the safe space people need before they can even consider asking for real help.`;

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI component' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', companion: 'Manas' });
});

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(PORT, () => {

    console.log(`\n🌿 Manas AI Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});
