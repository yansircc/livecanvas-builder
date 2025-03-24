"use server";

const animals = ["dog", "cat", "bird", "fish", "snake"];

export async function getLlmResponse(prompt: string) {
  const random = Math.random();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    code: `\`\`\`python\nprint(${random})\n\`\`\``,
    advices: [
      `This is a mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }`,
      `This is another mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }`,
      `This is a third mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }`,
    ],
  };
}
