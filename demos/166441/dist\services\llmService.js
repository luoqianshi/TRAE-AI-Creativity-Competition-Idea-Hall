"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSuggestions = exports.analyzeFeedback = exports.generatePlan = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const generatePlanPrompt = (request) => {
    return `
    You are a smart personal assistant that helps users create detailed plans. 
    Based on the user's input: "${request.userInput}"
    Create a comprehensive ${request.timeScope || 'week'} plan with the following structure:
    - Title: A clear, concise title for the plan
    - Description: A brief overview of what this plan aims to achieve
    - Tasks: A list of tasks with subtasks if needed. Each task should have:
      * title: What needs to be done
      * description: Details about the task
      * dueDate: When it should be completed (ISO format)
      * priority: low, medium, high, or urgent
      
    The plan should be realistic and actionable. Break down big goals into manageable tasks.
    Consider dependencies between tasks and suggest a logical order.
    
    Return ONLY a valid JSON object with the following structure:
    {
      "title": "string",
      "description": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "dueDate": "ISO date string",
          "priority": "low|medium|high|urgent",
          "subtasks": []
        }
      ]
    }
  `;
};
const analyzeFeedbackPrompt = (taskTitle, feedback, issueType) => {
    return `
    You are a smart personal assistant analyzing task feedback.
    Task: "${taskTitle}"
    Feedback: "${feedback}"
    Issue Type: "${issueType || 'not specified'}"
    
    Analyze why this task might not have been completed or why there are issues.
    Provide:
    1. aiAnalysis: A thoughtful analysis of the situation
    2. suggestedChanges: Array of adjustments to help complete this task
    
    Return ONLY a valid JSON object with the following structure:
    {
      "aiAnalysis": "string",
      "suggestedChanges": [
        {
          "type": "reorder|split|delay|remove",
          "targetTaskId": "current-task-id",
          "description": "string explaining the change"
        }
      ]
    }
  `;
};
const generateSuggestionsPrompt = (recentActivity) => {
    const activitiesStr = recentActivity.map(a => `${a.timestamp}: ${a.type} - ${a.details}`).join('\n');
    return `
    You are a smart personal assistant that provides helpful suggestions.
    Based on the user's recent activity:
    ${activitiesStr}
    
    Provide 3-5 suggestions that could help the user improve their productivity or achieve their goals better.
    Suggestions can be about:
    - related_plan: A new plan that complements their current goals
    - improvement: How to improve their approach
    - resource: Recommended resources
    - habit: Suggested habits to build
    
    Return ONLY a valid JSON object with the following structure:
    {
      "suggestions": [
        {
          "title": "string",
          "description": "string",
          "type": "related_plan|improvement|resource|habit",
          "priority": "low|medium|high"
        }
      ]
    }
  `;
};
const generatePlan = async (request) => {
    const prompt = generatePlanPrompt(request);
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });
    const content = response.choices[0].message.content || '{}';
    const data = JSON.parse(content);
    const now = new Date();
    const tasks = data.tasks.map((task, index) => ({
        id: `task-${now.getTime()}-${index}`,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate),
        priority: task.priority || 'medium',
        completed: false,
        subtasks: task.subtasks?.map((subtask, subIndex) => ({
            id: `subtask-${now.getTime()}-${index}-${subIndex}`,
            title: subtask.title,
            description: subtask.description,
            dueDate: new Date(subtask.dueDate),
            priority: subtask.priority || 'low',
            completed: false,
        })) || [],
    }));
    return {
        id: `plan-${now.getTime()}`,
        title: data.title,
        description: data.description,
        userInput: request.userInput,
        timeScope: request.timeScope || 'week',
        priority: request.priority || 'medium',
        tasks,
        createdAt: now,
    };
};
exports.generatePlan = generatePlan;
const analyzeFeedback = async (taskTitle, feedback, issueType) => {
    const prompt = analyzeFeedbackPrompt(taskTitle, feedback, issueType);
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });
    const content = response.choices[0].message.content || '{}';
    const data = JSON.parse(content);
    const suggestedChanges = data.suggestedChanges.map((change) => ({
        type: change.type,
        targetTaskId: change.targetTaskId,
        description: change.description,
    }));
    return {
        success: true,
        aiAnalysis: data.aiAnalysis,
        suggestedChanges,
    };
};
exports.analyzeFeedback = analyzeFeedback;
const generateSuggestions = async (recentActivity) => {
    const prompt = generateSuggestionsPrompt(recentActivity);
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });
    const content = response.choices[0].message.content || '{}';
    const data = JSON.parse(content);
    return data.suggestions.map((suggestion) => ({
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.type,
        priority: suggestion.priority,
    }));
};
exports.generateSuggestions = generateSuggestions;
