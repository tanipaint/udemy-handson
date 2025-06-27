/**
 * RAG extra用のAPIルート
 */
import { getBase64File } from '@/util/extra-1/blob';
import { getItemsByVector } from '@/util/extra-1/cosmos';
import {
  getChatCompletions,
  getEmbedding,
} from '@/util/extra-1/openai-extra-shrkm';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export const POST = async (req: NextRequest) => {
  try {
    const { message } = await req.json();

    console.log('🚀RAG-extra用のAPIルート');

    // ベクトル化
    console.log('🚀Get embedding from Azure OpenAI.');
    const embeddedMessage = await getEmbedding(message);

    // CosmosDBでベクトル検索
    console.log('🚀Search vector from Azure CosmosDB.');
    const cosmosItems = await getItemsByVector(embeddedMessage);

    // systemMessageにRAGの情報を追加
    console.log('🚀Create system message and image_content.');
    let systemMessage =
      'あなたが持っている知識は使ってはいけません。 "検索結果" と画像の情報のみを使い回答しなさい。わからない場合は「分かりません。」と回答しなさい。';
    systemMessage += '# 検索結果\n';
    let images = [];
    for (const result of cosmosItems) {
      // ループ番号を追加
      systemMessage +=
        '## ' +
        (cosmosItems.indexOf(result) + 1) +
        '\n' +
        result.content +
        '\n\n';
      // 画像の取得
      if (result.is_contain_image === true) {
        const image = await getBase64File(result.image_blob_path);
        images.push(image);
      }
    }
    console.log('🚀systemMessage:', systemMessage);

    // OpenAI へのリクエスト
    const result = await getChatCompletions(systemMessage, message, images);
    let aiMessage = result[0].message.content;

    return NextResponse.json({ aiMessage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ aiMessage: error.message }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';