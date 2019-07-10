<p align="center"><img src="https://validate-graphql.s3.amazonaws.com/ezgif.com-gif-maker+(1).gif" width="150" /></p>
<p align="center"><img src="https://validate-graphql.s3.amazonaws.com/ezgif.com-gif-maker+(2).gif" width="150" /></p>

# validate-graphql
[![NPM version](https://img.shields.io/npm/v/graphql-validation.svg)](https://www.npmjs.com/package/graphql-validation)
[![Minified size](https://img.shields.io/bundlephobia/min/graphql-validation.svg)](https://img.shields.io/bundlephobia/min/graphql-validation.svg)
[![License: MIT](https://img.shields.io/npm/l/graphql-validation.svg)](https://opensource.org/licenses/MIT)

`validate-graphql` is a simple and elegant module that provides you an easy way to validate your queries and mutation with your own logic.
By default this module does not provide any existing validators but allows an excellent way to configure your own
validation logic by accepting your own validation functions that can be executed before your resolver gets executed.

## Features
- Can be used to validate type validation and value validation
- Provides and easy way to write your own validation logic before your resolver is invoked
- Enables you to effectively modularize your codebase by delegating your validation logic into separate module.
- Written on Pure Javascript.

## Install
```sh
npm i --save validate-graphql
```
## Usage
Lets say if you have your queries like below:
```javascript
getAllUsers: {
  type: new GraphQLList(userType),
  args: {
  id: userIdField,
  },
  resolve: resolveGetAllUsers,
},
 .
 .
 .
};

let queries = [...getAllUsers, your_other_queries]
let mutations = [...createUser, your_other_mutations]
```
Use the below code at the application start on the file where you build your schema.
```javascript
 validate_graphql({ "user_queries": queries, "product_queries": product_queries }, { "user_mutations": mutations }); 
 ```
 
 if you have only one queries array on the whole you can just use
 ```javascript
 validate_graphql({ "my_queries": queries }, { "my_mutations": mutations });
 ```
 "my_queries" and "my_mutations" are **user defined** names where you can provide any name of your choice.
 **queries** is your array of **graphql queries** and **mutations** is your array of **graphql mutations**
 
 Then you shoudl pass ```validatedQueries["my_queries"]``` hash and ```validatedMutation["my_mutations"]``` to your schema 
 instead of **queries** and **mutations**
 
> Please refer example below
```javascript
 let schema = new GraphQLSchema({
	query: new GraphQLObjectType({
	name: 'RootQuery',
	fields: () => validatedQueries['my_queries'], 
	}),
	mutation: new GraphQLObjectType({
	name: 'RootMutation',
	fields: () => validatedMutations['my_mutations'],
	}),
   
```
So instead of passing your queries and mutations directly you have to use validatedQueries["queries"] and 
validatedMutations["mutations"]where "queries" and "mutations" arguments are the user defined names that you have given 
while invoking grapql_validate method.

#An Finally you have to add validate key to your query and mutation for which you want validation to be done:

**validate** key will accept only a function. You will be getting args and context in the function that you will pass
to the validate key.

Please see below example:
```javascript
getAllUsers: {
  type: new GraphQLList(userType),
  args: {
  id: userIdField,
  role: userRoleField
  },
  resolve: resolveGetAllUsers,
  validate: function(args, context){ //Please note you will get only two arguments args and context
    if(args.role == 'admin'){
      return { status: true}
    }else {
      return { status: false, message: "Role shoule be admin"}
    }
  }
},
```

If the return value contains **status** to be true we will execute your resolver function and send the response.
If it fails we will throw error message that you pass in the return status as **message** as shown above.

If you want to return custom error message from your own validate function you should pass **data** key in the 
return statement. Please see example below:

```javascript
getAllUsers: {
  type: new GraphQLList(userType),
  args: {
  id: userIdField,
  role: userRoleField
  },
  resolve: resolveGetAllUsers,
  validate: function(args, context){ //Please note you will get only two arguments args and context
    if(args.role == 'admin'){
      return { status: true}
    }else {
      return { status: false, data: { code: "103", message: "My Custome Error message"}}
      //In case your validation returns false response will be
      //{ code: "103", message: "My Custome Error message"}
    }
  }
},
```
>In case if you have doubt please post an issue and I will make sure this code base is updated frequently.

## Methods
> **validate_graphql**(queriesJSON :JSON, mutationsJSON :JSON)

**Please feel free to Contribute.**

>Please give me a pull request after making changes to your forked repo.

## License
`validate-graphql` is released under the MIT license. See [LICENSE](./LICENSE) for details.  