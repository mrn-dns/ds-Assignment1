import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from "./auth-api";
import { AppApi } from "./app-api";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { drivers, teams } from "../seed/teams";
import { generateBatch } from "../shared/util";

export class AuthAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TABLES

    // Teams table
    const teamsTable = new dynamodb.Table(this, "TeamsTable", {
      partitionKey: { name: "teamId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: "Teams",
    });

    // Drivers table
    const driversTable = new dynamodb.Table(this, "DriversTable", {
      partitionKey: { name: "teamId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "driverId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: "Drivers",
    });

    // Translations table
    const translationsTable = new dynamodb.Table(this, "TranslationsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "OriginalText",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "TargetLanguage", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Translations",
    });

    // MARSHALLING DATA FOR TABLES
    new custom.AwsCustomResource(this, "TeamsTableInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [teamsTable.tableName]: generateBatch(teams),
            [driversTable.tableName]: generateBatch(drivers),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of(
          "TeamsDriversTableInitData"
        ),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [teamsTable.tableArn, driversTable.tableArn],
      }),
    });

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolId = userPool.userPoolId;

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    const userPoolClientId = appClient.userPoolClientId;

    new AuthApi(this, "AuthServiceApi", {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
    });

    new AppApi(this, "AppApi", {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      teamsTable: teamsTable,
      driversTable: driversTable,
      translationsTable: translationsTable,
    });
  }
}
