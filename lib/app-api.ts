import { Aws } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import { drivers, teams } from "../seed/teams";
import { generateBatch } from "../shared/util";

type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
};

export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    // TABLES

    // Teams table
    const teamsTable = new dynamodb.Table(this, "TeamsTable", {
      partitionKey: { name: "teamId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Drivers table
    const driversTable = new dynamodb.Table(this, "DriversTable", {
      partitionKey: { name: "teamId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "driverId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
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

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "App RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    };

    const protectedRes = appApi.root.addResource("protected");

    const publicRes = appApi.root.addResource("public");

    const protectedFn = new node.NodejsFunction(this, "ProtectedFn", {
      ...appCommonFnProps,
      entry: "./lambda/protected.ts",
    });

    const publicFn = new node.NodejsFunction(this, "PublicFn", {
      ...appCommonFnProps,
      entry: "./lambda/public.ts",
    });

    const authorizerFn = new node.NodejsFunction(this, "AuthorizerFn", {
      ...appCommonFnProps,
      entry: "./lambda/auth/authorizer.ts",
    });

    const requestAuthorizer = new apig.RequestAuthorizer(
      this,
      "RequestAuthorizer",
      {
        identitySources: [apig.IdentitySource.header("cookie")],
        handler: authorizerFn,
        resultsCacheTtl: cdk.Duration.minutes(0),
      }
    );

    protectedRes.addMethod("GET", new apig.LambdaIntegration(protectedFn), {
      authorizer: requestAuthorizer,
      authorizationType: apig.AuthorizationType.CUSTOM,
    });

    publicRes.addMethod("GET", new apig.LambdaIntegration(publicFn));
  }
}
