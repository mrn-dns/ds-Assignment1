import { marshall } from "@aws-sdk/util-dynamodb";
import { Team, Driver } from "./types";

// Function to generate a PutRequest for a Team item
export const generateTeamItem = (team: Team) => {
  return {
    PutRequest: {
      Item: marshall(team),
    },
  };
};

// Function to generate a PutRequest for a Driver item
export const generateDriverItem = (driver: Driver) => {
  return {
    PutRequest: {
      Item: marshall(driver),
    },
  };
};

// Function to generate a batch of Team items
export const generateTeamBatch = (data: Team[]) => {
  return data.map((team) => {
    return generateTeamItem(team);
  });
};

// Function to generate a batch of Driver items
export const generateDriverBatch = (data: Driver[]) => {
  return data.map((driver) => {
    return generateDriverItem(driver);
  });
};
