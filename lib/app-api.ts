import { Aws } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import { get } from "http";

type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
  teamsTable: dynamodb.Table;
  driversTable: dynamodb.Table;
};

export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "Formula 1 App RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
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
        TEAMS_TABLE: props.teamsTable.tableName,
        DRIVERS_TABLE: props.driversTable.tableName,
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    };

    // APP FUNCTIONS

    // getAllTeams
    const teamsEndpoint = appApi.root.addResource("teams");
    const getAllTeams = new lambdanode.NodejsFunction(this, "GetAllTeamsFn", {
      ...appCommonFnProps,
      entry: "./lambda/app-api/getAllTeams.ts",
    });

    // getTeamById
    const teamEndpoint = appApi.root.addResource("team");
    const teamByIdEndpoint = teamEndpoint.addResource("{teamId}");
    const getTeamFn = new lambdanode.NodejsFunction(this, "GetTeamFn", {
      ...appCommonFnProps,
      entry: "./lambda/app-api/getTeamById.ts",
    });

    // addTeam
    const addTeamFn = new lambdanode.NodejsFunction(this, "AddTeamFn", {
      ...appCommonFnProps,
      entry: "./lambda/app-api/addTeam.ts",
    });

    // deleteTeam and associated drivers
    const deleteTeamFn = new lambdanode.NodejsFunction(this, "DeleteTeamFn", {
      ...appCommonFnProps,
      entry: "./lambda/app-api/deleteTeam.ts",
    });

    // PERMISSIONS
    props.teamsTable.grantReadData(getAllTeams);
    props.teamsTable.grantReadData(getTeamFn);
    props.driversTable.grantReadData(getTeamFn);
    props.teamsTable.grantReadWriteData(addTeamFn);
    props.teamsTable.grantReadWriteData(deleteTeamFn);
    props.driversTable.grantReadWriteData(deleteTeamFn);

    const protectedRes = appApi.root.addResource("protected");

    const publicRes = appApi.root.addResource("public");

    const protectedFn = new lambdanode.NodejsFunction(this, "ProtectedFn", {
      ...appCommonFnProps,
      entry: "./lambda/protected.ts",
    });

    const publicFn = new lambdanode.NodejsFunction(this, "PublicFn", {
      ...appCommonFnProps,
      entry: "./lambda/public.ts",
    });

    const authorizerFn = new lambdanode.NodejsFunction(this, "AuthorizerFn", {
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

    teamByIdEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getTeamFn, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM,
      }
    );
    teamEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(addTeamFn, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM,
      }
    );
    teamsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllTeams, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM,
      }
    );
    teamByIdEndpoint.addMethod(
      "DELETE",
      new apig.LambdaIntegration(deleteTeamFn, { proxy: true }),
      {
        authorizer: requestAuthorizer,
        authorizationType: apig.AuthorizationType.CUSTOM,
      }
    );
  }
}
