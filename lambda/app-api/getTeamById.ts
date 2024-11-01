import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    const parameters = event?.pathParameters;
    const teamId = parameters?.teamId ? parseInt(parameters.teamId) : undefined;

    if (!teamId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing team ID" }),
      };
    }

    // Fetch the team data from the TeamsTable
    const teamData = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TEAMS_TABLE,
        Key: { teamId: teamId },
      })
    );

    if (!teamData.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Invalid team ID" }),
      };
    }

    let responseBody: any = {
      team: teamData.Item,
    };

    // If the `drivers` query parameter is true, fetch drivers for the team
    const queryParams = event.queryStringParameters;
    if (queryParams && queryParams.drivers === "true") {
      const driversData = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DRIVERS_TABLE,
          KeyConditionExpression: "teamId = :t",
          ExpressionAttributeValues: {
            ":t": teamId,
          },
        })
      );

      responseBody.drivers = driversData.Items || [];
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(responseBody),
    };
  } catch (error: any) {
    console.error("[ERROR]", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to retrieve team data" }),
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
