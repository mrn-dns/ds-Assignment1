## Serverless REST Assignment - Distributed Systems.

**Name:** Denis Marincas

**Demo:** https://youtu.be/NyJvzdrEEog

### Context.

The context I chose for my web API is Formula 1. There are 6 teams and each team has 2 drivers. I have 3 Dynamo DB tables and they are the following:

- <ins>Team Table:</ins> teamId(Int), name(String), base(String), teamPrincipal(String), worldChampionships(Int), founded(Int), description(String)
- <ins>Driver Table:</ins> driverId(Int), teamId(Int), name(String), nationality(String), dateOfBirth(String), championshipsWon(Int), carNumber(Int), description(String)
- <ins>Translation Table:</ins> OriginalText(String), TargetLanguage(String), TranslatedText(String)

### App API endpoints.

- **GET /teams** - Get all teams
- **GET /team/{teamId}** - Get details about one specific team
- **GET /team/{teamId}?drivers=true** - Get details about one specific team and the drivers associated with the team
- **GET /driver/{teamId}/{driverId}** - Get specific driver details from a specific team
- **GET /team/{teamId}/translation?language={languageCode}** - Get description translation of a specific team in a specifi language
- **POST /team** - Add a new team
- **DEL /team/{teamId}** - Delete a team by specifying teamId
- **PATCH /team/{teamId}/updateDescription** - Modify one specific field, which is the team description of a specific team
- **PUT /team/{teamId}** - Modify all fields of a team

### Update constraint (if relevant).

No constraint added.

### Translation persistence (if relevant).

Tutorials I followed to implement this feature:

- https://blog.tericcabrel.com/text-translation-aws-translate-nodejs/#:~:text=Using%20the%20client%20SDK%20to%20translate%20a%20text,the%20client%20instance%20by%20passing%20the%20command%20object.
- https://www.youtube.com/watch?v=xdWpbr1DZHQ

To make the translation process persistent, I have created a DynamoDB table for the resulted translations from the team descriptions. This table stores the original text of the description, the language in which the user wishes to translate and the result of the translation.

To make Amazon Translate calls persistent and avoid repeated requests, I check before doing the translation to see if a translation already exists for the given OriginalText and TargetLanguage. If the translation does not exist in the table, Amazon Translate is called and retrieves the translated text, storing it in the table. On the next calls for translation for the same text in the same language that is already existent, the function directly returns the cached translation from DynamoDB.

### Extra (If relevant).

I have created a multi-stack solution for this assignment by separating the concerns of each stack. I have 3 stacks: app-api, auth-api and auth-app-stack.

App-api is responsible with provisioning the lambda functions related to the functionality of the application. This is where the functions are attributed permissions to the tables and routes linked with GET/POST/PUT/PATCH methods are created.

Auth-api has the same responsibilities as app-api but for the authentication lambda functions.

Auth-app-stack is where the DynamoDB tables are defined and provisioned, data is marshalled, the user pool is created and the two APIs, app-api and auth-api are defined.

The lambda functions that define the functionality of the auth=api and the app-api are located in a lambda folder which has 2 subfolders: app-api and auth. App-api contains all lambda functions associated with the Formula 1 drivers and teams and auth contains all lambda functions associated with the authentication api.
