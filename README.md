## Serverless REST Assignment - Distributed Systems.

**Name:** Denis Marincas

**Demo:** ... link to your YouTube video demonstration ......

### Context.

The context I chose for my web API is Formula 1. I have 3 Dynamo DB tables and they are the following:

- <ins>Team Table:</ins> teamId(Int), name(String), base(String), teamPrincipal(String), worldChampionships(Int), founded(Int), description(String)
- <ins>Driver Table:</ins> driverId(Int), teamId(Int), name(String), nationality(String), dateOfBirth(String), championshipsWon(Int), carNumber(Int), description(String)
- <ins>Translation Table:</ins> OriginalText(String), TargetLanguage(String), Translations(String)

### App API endpoints.

- GET /teams - Get all teams
- GET /team/{teamId} - Get details about one specific team
- GET /team/{teamId}?drivers=true - Get details about one specific team and the drivers associated with the team
- GET /driver/{teamId}/{driverId} - Get specific driver details from a specific team
- GET /team/{teamId}/translation?language={languageCode} - Get description translation of a specific team in a specifi language
- POST /team - Add a new team
- DEL /team/{teamId} - Delete a team by specifying teamId
- PATCH /team/{teamId}/updateDescription - Modify one specific field, which is the team description of a specific team
- PUT /team/5 - Modify all fields of a team

### Update constraint (if relevant).

[Briefly explain your design for the solution to the PUT/Update constraint

- only the user who added an item to the main table could update it.]

### Translation persistence (if relevant).

[Briefly explain your design for the solution to avoid repeat requests to Amazon Translate - persist translations so that Amazon Translate can be bypassed for repeat translation requests.]

### Extra (If relevant).

[ State whether you have created a multi-stack solution for this assignment or used lambda layers to speed up update deployments. Also, mention any aspect of the CDK framework __that was not covered in the lectures that you used in this assignment. ]
