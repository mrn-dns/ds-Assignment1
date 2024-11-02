import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

// Initialize clients
const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);
const translateClient = new TranslateClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    // Retrieve teamId and language from the request
    const teamId = event.pathParameters?.teamId;
    const language = event.queryStringParameters?.language;

    if (!teamId || !language) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing team ID or language" }),
      };
    }

    // Fetch the team's description from the Teams table
    const teamResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TEAMS_TABLE,
        Key: { teamId: parseInt(teamId) },
      })
    );

    const team = teamResult.Item;
    if (!team || !team.description) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Team or description not found" }),
      };
    }

    // Check for an existing translation in the TranslationsTable
    const translationKey = {
      OriginalText: team.description,
      TargetLanguage: language,
    };
    const translationResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TRANSLATIONS_TABLE,
        Key: translationKey,
      })
    );

    if (translationResult.Item) {
      // Translation exists in the Translations table, return it
      return {
        statusCode: 200,
        body: JSON.stringify({
          description: translationResult.Item.TranslatedText,
        }),
      };
    }

    // Perform the translation if it does not exist
    const translateResult = await translateClient.send(
      new TranslateTextCommand({
        Text: team.description,
        SourceLanguageCode: "en",
        TargetLanguageCode: language,
      })
    );

    // Store the translation in the TranslationsTable
    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TRANSLATIONS_TABLE,
        Item: {
          ...translationKey,
          TranslatedText: translateResult.TranslatedText,
        },
      })
    );

    // Return the translated description
    return {
      statusCode: 200,
      body: JSON.stringify({
        description: translateResult.TranslatedText,
      }),
    };
  } catch (error: any) {
    console.error("[ERROR]", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Failed to retrieve or translate description",
      }),
    };
  }
};
