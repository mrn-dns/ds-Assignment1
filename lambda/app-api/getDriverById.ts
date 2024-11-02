import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.REGION })
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    // Retrieve teamId and driverId from path parameters
    const teamId = event.pathParameters?.teamId;
    const driverId = event.pathParameters?.driverId;

    if (!teamId || !driverId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing teamId or driverId" }),
      };
    }

    // Parse IDs to ensure they are numbers
    const parsedTeamId = parseInt(teamId);
    const parsedDriverId = parseInt(driverId);
    if (isNaN(parsedTeamId) || isNaN(parsedDriverId)) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Invalid teamId or driverId format" }),
      };
    }

    // Fetch the driver data from DynamoDB
    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DRIVERS_TABLE,
        Key: {
          teamId: parsedTeamId,
          driverId: parsedDriverId,
        },
      })
    );

    // Return 404 if driver not found
    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Driver not found" }),
      };
    }

    // Return the driver data
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(commandOutput.Item),
    };
  } catch (error: any) {
    console.error("[ERROR]", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Failed to retrieve driver data" }),
    };
  }
};
