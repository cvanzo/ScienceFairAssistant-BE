const OpenAI = require('openai');
require('dotenv').config();

// Configure the OpenAI client with your API key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

// Function to generate an answer using OpenAI
const generateAnswer = async (question, fileContent) => {
  console.log('Generating answer for:', question); // Log the question being processed
  try {
    const combinedPrompt = `${fileContent}\n\n${question}`;
    const chatCompletion = await client.chat.completions.create({
      messages: [   
        // set base personality     
        { role: 'system', content: "You are a helpful science fair assistant for grades 3 to 6. Keep answer as short as possible.  " },
        // give knowledge from uploaded doc
        { role: 'system', content: "This is the assistants knowledge of the science fair: " + fileContent },
        // what do do when the answer isn't in the document
        { role: 'system', content: "When an answer can not be from the assistants knowledge, then state that the information isn't known.  Then give the most probable answer and remind the student to ask their teacher for clarity." },
        { role: 'user', content: "question: " + question },

      ],
      model: 'gpt-3.5-turbo',
    });

    console.log('OpenAI response:', chatCompletion); // Log the response from OpenAI
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateAnswer:', error); // Log the error
    throw error;
  }
};

module.exports = { generateAnswer };
