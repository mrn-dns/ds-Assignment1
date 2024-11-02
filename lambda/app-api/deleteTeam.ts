import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Print Event
    console.log("[EVENT]", JSON.stringify(event));

    const teamId = event.pathParameters?.teamId;
    if (!teamId) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing team ID" }),
      };
    }

    // Convert teamId to integer
    const parsedTeamId = parseInt(teamId);

    // Query drivers associated with the teamId
    const driversQueryOutput = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.DRIVERS_TABLE,
        KeyConditionExpression: "teamId = :teamId",
        ExpressionAttributeValues: {
          ":teamId": parsedTeamId,
        },
      })
    );

    // Delete each driver associated with the team
    if (driversQueryOutput.Items) {
      const deleteDriverPromises = driversQueryOutput.Items.map((driver) =>
        ddbDocClient.send(
          new DeleteCommand({
            TableName: process.env.DRIVERS_TABLE,
            Key: { teamId: parsedTeamId, driverId: driver.driverId },
          })
        )
      );
      // Await all delete operations for drivers
      await Promise.all(deleteDriverPromises);
    }

    // Delete the team from the teams table
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TEAMS_TABLE,
        Key: { teamId: parsedTeamId },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Team and related drivers deleted" }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        error: error.message || "Failed to delete team and related drivers",
      }),
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
