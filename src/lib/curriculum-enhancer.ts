// Helper to enhance curriculum with difficulty, time, and motivational content
export function enhanceCurriculumDay(day: number, topic: string, project: string): {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    why: string;
    realWorld: string;
    path: ('beginner' | 'intermediate' | 'advanced' | 'all')[];
} {
    // Determine difficulty based on day number and topic
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    let estimatedHours = 3;
    let path: ('beginner' | 'intermediate' | 'advanced' | 'all')[] = ['all'];
    
    // Days 1-20: Beginner
    if (day <= 20) {
        difficulty = 'beginner';
        estimatedHours = day <= 10 ? 2 : 3;
        path = ['beginner', 'all'];
    }
    // Days 21-50: Beginner to Intermediate
    else if (day <= 50) {
        difficulty = topic.includes('Advanced') || topic.includes('Theory') ? 'intermediate' : 'beginner';
        estimatedHours = 3;
        path = ['beginner', 'intermediate', 'all'];
    }
    // Days 51-100: Intermediate
    else if (day <= 100) {
        difficulty = 'intermediate';
        estimatedHours = topic.includes('Capstone') ? 4 : 3;
        path = ['intermediate', 'all'];
    }
    // Days 101-200: Intermediate to Advanced
    else if (day <= 200) {
        difficulty = topic.includes('Advanced') || topic.includes('Deep') ? 'advanced' : 'intermediate';
        estimatedHours = 3;
        path = ['intermediate', 'advanced', 'all'];
    }
    // Days 201-300: Advanced
    else {
        difficulty = 'advanced';
        estimatedHours = topic.includes('Project') || topic.includes('Capstone') ? 4 : 3;
        path = ['advanced', 'all'];
    }
    
    // Generate "why this matters" based on topic keywords
    const why = generateWhy(topic, project);
    const realWorld = generateRealWorld(topic);
    
    return {
        difficulty,
        estimatedHours,
        why,
        realWorld,
        path
    };
}

function generateWhy(topic: string, project: string): string {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('python') && topicLower.includes('basics')) {
        return 'Master the building blocks of programming. Everything in AI starts here.';
    }
    if (topicLower.includes('numpy')) {
        return 'NumPy powers all numerical computing in Python. Essential for ML and data science.';
    }
    if (topicLower.includes('pandas')) {
        return 'Pandas makes data manipulation intuitive. Used in every data science project.';
    }
    if (topicLower.includes('visualization') || topicLower.includes('matplotlib') || topicLower.includes('seaborn')) {
        return 'Data visualization reveals insights hidden in numbers. Make your data tell a story.';
    }
    if (topicLower.includes('regression')) {
        return 'Regression is the foundation of predictive modeling. Predict the future from past data.';
    }
    if (topicLower.includes('classification')) {
        return 'Classification powers spam filters, medical diagnosis, and fraud detection.';
    }
    if (topicLower.includes('neural network') || topicLower.includes('deep learning')) {
        return 'Neural networks are the brain of modern AI. Learn how machines learn to think.';
    }
    if (topicLower.includes('cnn') || topicLower.includes('convolutional')) {
        return 'CNNs revolutionized computer vision. Teach machines to see and understand images.';
    }
    if (topicLower.includes('rnn') || topicLower.includes('lstm') || topicLower.includes('recurrent')) {
        return 'RNNs understand sequences and time. Power behind speech recognition and language models.';
    }
    if (topicLower.includes('nlp') || topicLower.includes('natural language')) {
        return 'NLP bridges human language and machines. Build chatbots, translators, and more.';
    }
    if (topicLower.includes('transformer') || topicLower.includes('bert') || topicLower.includes('gpt')) {
        return 'Transformers power ChatGPT and modern AI. The most important breakthrough in recent years.';
    }
    if (topicLower.includes('gan') || topicLower.includes('generative')) {
        return 'Generative AI creates new content. From art to music to realistic images.';
    }
    if (topicLower.includes('reinforcement')) {
        return 'Reinforcement learning trains AI through trial and error. How AlphaGo beat world champions.';
    }
    if (topicLower.includes('deployment') || topicLower.includes('mlops')) {
        return 'Building models is half the battle. Learn to deploy AI that millions can use.';
    }
    if (topicLower.includes('cloud')) {
        return 'Scale your AI to handle millions of users. Cloud platforms make it possible.';
    }
    if (topicLower.includes('ethics') || topicLower.includes('bias')) {
        return 'With great power comes great responsibility. Build AI that is fair and beneficial.';
    }
    if (topicLower.includes('interview') || topicLower.includes('career')) {
        return 'Land your dream AI job. Preparation is the key to success.';
    }
    if (topicLower.includes('capstone') || topicLower.includes('project')) {
        return 'Apply everything you have learned. Build something real and showcase your skills.';
    }
    
    // Default
    return 'Expand your AI toolkit. Every skill brings you closer to mastery.';
}

function generateRealWorld(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('python basics') || topicLower.includes('variables') || topicLower.includes('loops')) {
        return 'Used in: All programming, automation, data science';
    }
    if (topicLower.includes('numpy')) {
        return 'Used in: TensorFlow, PyTorch, scikit-learn, image processing';
    }
    if (topicLower.includes('pandas')) {
        return 'Used in: Data analysis, feature engineering, business intelligence';
    }
    if (topicLower.includes('visualization')) {
        return 'Used in: Data analysis, reporting, dashboards, presentations';
    }
    if (topicLower.includes('regression')) {
        return 'Used in: Price prediction, sales forecasting, risk assessment';
    }
    if (topicLower.includes('classification')) {
        return 'Used in: Spam detection, medical diagnosis, fraud detection';
    }
    if (topicLower.includes('clustering')) {
        return 'Used in: Customer segmentation, anomaly detection, recommendation systems';
    }
    if (topicLower.includes('neural network') || topicLower.includes('deep learning')) {
        return 'Used in: Image recognition, speech recognition, autonomous vehicles';
    }
    if (topicLower.includes('cnn') || topicLower.includes('computer vision')) {
        return 'Used in: Face recognition, medical imaging, self-driving cars';
    }
    if (topicLower.includes('rnn') || topicLower.includes('lstm')) {
        return 'Used in: Speech recognition, language translation, time series forecasting';
    }
    if (topicLower.includes('nlp')) {
        return 'Used in: Chatbots, sentiment analysis, document classification';
    }
    if (topicLower.includes('transformer') || topicLower.includes('bert') || topicLower.includes('gpt')) {
        return 'Used in: ChatGPT, Google Search, language translation, content generation';
    }
    if (topicLower.includes('gan')) {
        return 'Used in: Image generation, deepfakes, art creation, data augmentation';
    }
    if (topicLower.includes('reinforcement')) {
        return 'Used in: Game AI, robotics, autonomous systems, resource optimization';
    }
    if (topicLower.includes('deployment') || topicLower.includes('flask') || topicLower.includes('api')) {
        return 'Used in: Production ML systems, web services, mobile apps';
    }
    if (topicLower.includes('cloud')) {
        return 'Used in: Scalable ML systems, enterprise AI, production deployments';
    }
    if (topicLower.includes('spark') || topicLower.includes('big data')) {
        return 'Used in: Large-scale data processing, enterprise analytics';
    }
    if (topicLower.includes('sql')) {
        return 'Used in: Data analysis, business intelligence, data engineering';
    }
    if (topicLower.includes('docker') || topicLower.includes('kubernetes')) {
        return 'Used in: DevOps, cloud deployment, microservices';
    }
    
    return 'Used in: Modern AI and data science applications';
}
