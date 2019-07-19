<!-- <p align="center"><img src="https://validate-graphql.s3.amazonaws.com/ezgif.com-gif-maker+(1).gif" width="250" />
<img src="https://validate-graphql.s3.amazonaws.com/ezgif.com-gif-maker+(2).gif" width="250" /></p> -->

# validate-graphql
[![NPM version](https://img.shields.io/npm/v/validate-graphql.svg?style=popout-square)](https://www.npmjs.com/package/validate-graphql)
[![License: MIT](https://img.shields.io/github/license/ganeshcse2991/validate-graphql.svg)](https://opensource.org/licenses/MIT)

`validate-graphql` is a simple and elegant module that provides you an easy way to validate your queries and mutation with your own logic and YUP validation module.
This allows an excellent way to configure your own validation logic by accepting your own validation functions that can be executed before your resolver gets executed.

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
Please add the below line to import from validate-graphql

```sh
import { ValidateGraphql, ValidatedQueries, ValidatedMutations } from 'validate-graphql';
```

Lets say if you have your queries like below:
```javascript
getAllUsers: {
  type: new GraphQLList(userType),
  args: {
  	id: userIdField,
  },
  resolve: resolveGetAllUsers,
}


createUser: {
  type: userType,
  args: {
  	name: userNameField,
	manager: userManagerField,
	email: userEmailField
  },
  resolve: resolveCreateUser,
}


let queries = [...getAllUsers, your_other_queries]
let mutations = [...createUser, your_other_mutations]
```
Use the below code on the file where you build your schema. This will build a custom schema on the application start.
```javascript
 ValidateGraphql({ "user_queries": queries, "product_queries": product_queries }, { "user_mutations": mutations }); 
 ```
 
 if you have only one queries array on the whole you can just use
 ```javascript
 ValidateGraphql({ "my_queries": queries }, { "my_mutations": mutations });
 ```
 "my_queries" and "my_mutations" are **user defined** names where you can provide any name of your choice.
 **queries, mutations** are your array of **graphql queries** and **graphql mutations** respectively.
 
 Then you should pass ```ValidatedQueries["my_queries"]``` hash and ```ValidatedMutations["my_mutations"]``` to your schema 
 instead of **queries** and **mutations**
 
> Please refer example below
```javascript
 let schema = new GraphQLSchema({
	query: new GraphQLObjectType({
	name: 'RootQuery',
	
	fields: () => ValidatedQueries['my_queries'], 
	
	}),
	mutation: new GraphQLObjectType({
	name: 'RootMutation',
	
	fields: () => ValidatedMutations['my_mutations'],
	
	}),
   
```
So instead of passing your queries and mutations directly you have to use ```ValidatedQueries["queries"]``` and 
```ValidatedMutations["mutations"]``` where "queries" and "mutations" arguments are the user defined names that you have given 
while invoking **ValidateGraphql** method.

And Finally you have to add **validate** key to your query and mutation for which you want validation to be done:

**validate** key will accept only a function. You will be getting args and context in the function that you will pass
to the validate key.

The **function that you give in "validate"** should return a JSON with **status** field value as true/false.
If **status** is true your resolver gets executed, else you will an error JSON with two keys **{ status: "Validation Failed", message: "Error message"}**.

If you want to return **custom error message** from your own validate function you should pass **data** key in the 
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

## Using YUP

You can give your [YUP](https://github.com/jquense/yup) schema on the field **validationSchema** in your query and mutation.
Please see this link on how to create [YUP SCHEMA](https://github.com/jquense/yup).

**NOTE: your "validationSchema"  will not get validated if you are not passing "valildate" field in your query and mutation.**
**Also your validationSchema will get exectuted first before your "validate" function.**

The field **validationSchema** accepts a JSON with two keys **schema** and **error_field**. You should give your **YUP schema** in schema key and **"errror_field"** should contain a string, which is the field name for your errors in the response.

```javascript
getAllUsers: {
  type: new GraphQLList(userType),
  args: {
  id: userIdField,
  role: userRoleField
  email: userEmailField
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
  },
  
  
  validationSchema: { schema: yupSchema, error_field: "errors" } //This will get executed before validate function
  //This will give { errors: "email is not valid" } as response for bad emails
  
},
```

**NOTE- If you are not passing "validate" key and "validationSchema" key your normal resolvers will get invoked asusual.**

>In case if you have doubt please post an issue and I will make sure this code base is updated frequently.

## Methods
> **ValidateGraphql**(queriesJSON :JSON, mutationsJSON :JSON)

**Please feel free to Contribute.**

>Please give me a pull request after making changes to your forked repo.

## License
`validate-graphql` is released under the MIT license. See [LICENSE](./LICENSE) for details.  
