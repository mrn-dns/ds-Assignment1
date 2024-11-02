import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    const teamId = event.pathParameters?.teamId;
    const body = event.body ? JSON.parse(event.body) : undefined;
    const description = body?.description;

    if (!teamId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing team ID" }),
      };
    }

    if (!description) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "Missing description in request body",
        }),
      };
    }

    const parsedTeamId = parseInt(teamId);
    if (isNaN(parsedTeamId)) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Invalid team ID format" }),
      };
    }

    // Update the team's description in DynamoDB
    const commandOutput = await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.TEAMS_TABLE,
        Key: { teamId: parsedTeamId },
        UpdateExpression: "set description = :desc",
        ExpressionAttributeValues: {
          ":desc": description,
        },
        ReturnValues: "UPDATED_NEW",
      })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Team description updated successfully",
        updatedAttributes: commandOutput.Attributes,
      }),
    };
  } catch (error: any) {
    console.error("[ERROR]", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Failed to update team description" }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
