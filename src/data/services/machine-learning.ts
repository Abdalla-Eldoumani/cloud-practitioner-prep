import type { ServiceEntry } from "../../lib/types";

// AWS category: Machine Learning. In-scope set: Amazon Comprehend, Amazon Kendra,
// Amazon Lex, Amazon Polly, Amazon Q, Amazon Rekognition, Amazon SageMaker AI,
// Amazon Textract, Amazon Transcribe, Amazon Translate. Use the appendix's exact
// current spelling (Amazon SageMaker AI, Amazon Q) verified at authoring time.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const machineLearning: ServiceEntry[] = [
  {
    id: "amazon-comprehend",
    name: "Amazon Comprehend",
    shortName: "Comprehend",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A natural language processing service that uses machine learning to find insights and relationships in text.",
    whenToUse:
      "Reach for it when you want to pull sentiment, key phrases, entities, or language from documents without training a model yourself.",
    reference: {
      label: "What is Amazon Comprehend?",
      url: "https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Comprehend",
      "natural language processing",
      "NLP",
      "text analysis",
      "sentiment analysis",
    ],
    relatedTerms: [
      "natural language processing",
      "sentiment",
      "entities",
      "text",
    ],
  },
  {
    id: "amazon-kendra",
    name: "Amazon Kendra",
    shortName: "Kendra",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "An intelligent enterprise search service that uses machine learning to find answers across an organization's content.",
    whenToUse:
      "Reach for it when you want users to ask natural-language questions and get precise answers from your internal documents and data sources.",
    reference: {
      label: "What is Amazon Kendra?",
      url: "https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Kendra",
      "enterprise search",
      "intelligent search",
      "document search",
    ],
    relatedTerms: [
      "enterprise search",
      "search",
      "natural language",
      "documents",
    ],
  },
  {
    id: "amazon-lex",
    name: "Amazon Lex",
    shortName: "Lex",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A service for building conversational interfaces, or chatbots, using voice and text.",
    whenToUse:
      "Reach for it when you want to build a chatbot or voice assistant that understands what a user is asking and responds.",
    reference: {
      label: "What is Amazon Lex?",
      url: "https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Lex",
      "chatbot",
      "chatbots",
      "conversational interface",
      "voice assistant",
    ],
    relatedTerms: ["chatbot", "conversational", "voice", "text"],
  },
  {
    id: "amazon-polly",
    name: "Amazon Polly",
    shortName: "Polly",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A service that turns text into lifelike speech using deep learning.",
    whenToUse:
      "Reach for it when you want to give an application a voice by reading text aloud, such as for narration or accessibility.",
    reference: {
      label: "What is Amazon Polly?",
      url: "https://docs.aws.amazon.com/polly/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Polly",
      "text to speech",
      "speech synthesis",
      "voice",
    ],
    relatedTerms: ["text to speech", "speech", "voice", "audio"],
  },
  {
    id: "amazon-q",
    name: "Amazon Q",
    shortName: "Q",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A generative AI-powered assistant that answers questions and helps with tasks using your business data and AWS expertise.",
    whenToUse:
      "Reach for it when you want a generative AI assistant that can answer questions, summarize, and help build using your own content and AWS knowledge.",
    reference: {
      label: "What is Amazon Q?",
      url: "https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Q",
      "generative AI assistant",
      "AI assistant",
      "generative AI",
    ],
    relatedTerms: [
      "generative AI",
      "assistant",
      "foundation models",
      "chat",
    ],
  },
  {
    id: "amazon-rekognition",
    name: "Amazon Rekognition",
    shortName: "Rekognition",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A service that adds image and video analysis to applications using machine learning.",
    whenToUse:
      "Reach for it when you want to detect objects, scenes, text, or faces in images and video without building a vision model.",
    reference: {
      label: "What is Amazon Rekognition?",
      url: "https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Rekognition",
      "image analysis",
      "video analysis",
      "image and video analysis",
      "computer vision",
    ],
    relatedTerms: ["image", "video", "computer vision", "facial analysis"],
  },
  {
    id: "amazon-sagemaker-ai",
    name: "Amazon SageMaker AI",
    shortName: "SageMaker AI",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A fully managed service to build, train, and deploy machine learning models at scale.",
    whenToUse:
      "Reach for it when you want an end-to-end platform to prepare data and build, train, and deploy your own machine learning models.",
    reference: {
      label: "What is Amazon SageMaker AI?",
      url: "https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "SageMaker",
      "SageMaker AI",
      "machine learning",
      "build train deploy models",
      "managed ML platform",
    ],
    relatedTerms: [
      "machine learning",
      "model training",
      "model deployment",
      "managed platform",
    ],
  },
  {
    id: "amazon-textract",
    name: "Amazon Textract",
    shortName: "Textract",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A service that automatically extracts text, handwriting, and data from scanned documents.",
    whenToUse:
      "Reach for it when you need to pull text and structured data out of forms, tables, or scanned documents instead of typing them in by hand.",
    reference: {
      label: "What is Amazon Textract?",
      url: "https://docs.aws.amazon.com/textract/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Textract",
      "extract text from documents",
      "document text extraction",
      "OCR",
    ],
    relatedTerms: ["text extraction", "documents", "forms", "handwriting"],
  },
  {
    id: "amazon-transcribe",
    name: "Amazon Transcribe",
    shortName: "Transcribe",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A service that converts speech in audio into text using automatic speech recognition.",
    whenToUse:
      "Reach for it when you want to turn recorded or live audio into a written transcript, such as for captions or call notes.",
    reference: {
      label: "What is Amazon Transcribe?",
      url: "https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Transcribe",
      "speech to text",
      "transcription",
      "automatic speech recognition",
    ],
    relatedTerms: ["speech to text", "audio", "transcription", "captions"],
  },
  {
    id: "amazon-translate",
    name: "Amazon Translate",
    shortName: "Translate",
    domain: 3,
    category: "Machine Learning",
    purpose:
      "A neural machine translation service that translates text between languages.",
    whenToUse:
      "Reach for it when you want to translate content from one language to another quickly and at scale.",
    reference: {
      label: "What is Amazon Translate?",
      url: "https://docs.aws.amazon.com/translate/latest/dg/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Translate",
      "language translation",
      "machine translation",
      "translation",
    ],
    relatedTerms: ["translation", "languages", "machine translation", "text"],
  },
];
