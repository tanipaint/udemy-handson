//

import { AzureKeyCredential, OpenAIClient } from '@azure/openai';

export const getChatCompletions = async (
  systemMessage: string,
  message: string,
  images: string[]
): Promise<any[]> => {
  console.log('start', process.env.AZURE_OPENAI_ENDPOINT!);
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;

    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(azureApiKey)
    );

    let messages;
    // もし画像があれば、画像も含めてメッセージを作成
    if (images.length > 0) {
      try {
        const response = await client.getChatCompletions(
          deploymentId,
          [
            { role: 'system', content: systemMessage },
            { role: 'user', content: message },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  imageUrl: {
                    url: `data:image/jpeg;base64,${images[0]}`,
                  },
                },
              ],
            },
          ],
          { maxTokens: 4096 }
        );
        resolve(response.choices);
      } catch (error: any) {
        reject(error);
      }
    }
    // 画像がない場合
    else {
      try {
        const response = await client.getChatCompletions(
          deploymentId,
          [
            { role: 'system', content: systemMessage },
            { role: 'user', content: message },
          ],
          { maxTokens: 4096 }
        );
        resolve(response.choices);
      } catch (error: any) {
        reject(error);
      }
    }
  });
};

// 引数をベクトル化しベクトル値を返却する
// Azure OpenAIのembeddingモデルを使用し、ベクトル化を行う
export const getEmbedding = async (message: string): Promise<number[]> => {
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_VEC_DEPLOYMENT_ID!;
    // clientはメソッドの外に出したほうがいい？
    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(azureApiKey)
    );
    const embedding = await client.getEmbeddings(deploymentId, [message]); // Pass message as an array
    // 返却
    resolve(embedding.data[0].embedding);
  });
};