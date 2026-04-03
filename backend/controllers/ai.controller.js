import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
export const summarizeInstantPDF = async (req, res) => {
    try {
        const API_KEY = process.env.OPENAI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                message:
                    "Server misconfigured: OPENAI_API_KEY missing in backend/.env. Add the key and restart the backend.",
            });
        }

       
        const rawBaseURL = process.env.OPENAI_BASE_URL?.replace(/\/$/, "");
        const baseURL = rawBaseURL
            ? rawBaseURL.endsWith("/v1")
                ? rawBaseURL
                : `${rawBaseURL}/v1`
            : undefined;

        let model = process.env.OPENAI_MODEL?.trim();
        if (!model) {
    
            if (baseURL) {
            
                const modelsUrl = `${baseURL}/models`;
                const resp = await fetch(modelsUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!resp.ok) {
                    return res.status(500).json({
                        message:
                            "Could not fetch model list from the OpenAI-compatible gateway. Set OPENAI_MODEL manually.",
                        status: resp.status,
                    });
                }

                const payload = await resp.json();
                model =
                    payload?.data?.[0]?.id ||
                    payload?.data?.[0]?.model ||
                    payload?.model ||
                    payload?.id ||
                    "";

                if (!model) {
                    return res.status(500).json({
                        message:
                            "Model discovery succeeded but no model was found. Set OPENAI_MODEL manually.",
                    });
                }
            } else {
                model = "gpt-4o-mini";
            }
        }

        console.log("[AI] gateway config", {
            baseURL: baseURL || "default",
            model,
        });

       
        const openai = new OpenAI({
            apiKey: API_KEY,
            baseURL: baseURL || undefined, 
        });

        if (!req.file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        
        const parser = new PDFParse({ data: req.file.buffer });
        let data;
        try {
            data = await parser.getText();
        } finally {
            await parser.destroy(); 
        }
        const text = data.text;

        if (!text || text.trim().length < 20) {
            return res.status(400).json({ message: "PDF is unreadable or empty." });
        }

        
        const aiResponse = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: `You are a Senior Technical Mentor. Summarize these notes for a student targeting 36LPA roles. 
                    Structure: 
                    - Core Concepts
                    - Essential Formulas/Logic
                    - Interview "Reality Check": Why does this matter for a company like Oracle?`
                },
                { role: "user", content: text.substring(0, 6000) }
            ]
        });

        res.json({
            success: true,
            summary: aiResponse.choices[0].message.content,
            metadata: { pages: data.total }
        });
    }  catch (error) {
        console.log("AI ERROR FULL:", error); 
        res.status(500).json({ message: "AI Error", error: error.message });
    }
};