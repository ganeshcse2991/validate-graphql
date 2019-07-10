export const validatedQueries = {};
export const validatedMutations = {};

export function validate_graphql(queries, mutations) {
	validation_iterator(queries, mutations);
}

function validation_iterator(schemaQueries, schemaMutations) {
	let queryNames = Object.keys(schemaQueries);
	try {
		queryNames.map((name) => {
			if (schemaQueries[name] != null) {
				let resourceQueries = Object.keys(schemaQueries[name]);
				resourceQueries.map((queryAsString) => {
					if (schemaQueries[name][queryAsString] != null) {
						let actualQuery = schemaQueries[name][queryAsString];
						actualQuery['resolve'] = replace_resolver(actualQuery.validate, actualQuery.resolve, actualQuery.validationSchema);
						schemaQueries[name][queryAsString] = actualQuery;
					}
				});
				validatedQueries[name] = schemaQueries[name];
			}
		});
	} catch (error) {
		console.log("Validation Query Error:");
		console.log(error);
		validatedQueries[schemaQueries]
	}

		try {
			let mutationsNames = Object.keys(schemaMutations);
			mutationsNames.map((name) => {
				if (schemaMutations[name] != null) {
					let resourceMutations = Object.keys(schemaMutations[name]);
					resourceMutations.map((mutationsAsString) => {
						if (schemaMutations[name][mutationsAsString] != null) {
							let actualMutation = schemaMutations[name][mutationsAsString];
							actualMutation['resolve'] = replace_resolver(actualMutation.validate, actualMutation.resolve, actualMutation.validationSchema);
							schemaMutations[name][mutationsAsString] = actualMutation;
						}
					});
					validatedMutations[name] = schemaMutations[name];
				}
			});
		} catch (error) {
			console.log("Validation Mutation Error:");
			console.log(error);
			validatedMutations[schemaMutations]
		}
}

function replace_resolver(validate, resolveFunction, schema) {
	return async function (obj, args, context, info) {
		try {
			let validatorType = typeof validate;
			if (validate != null && validate != undefined && validatorType == 'function') {
				let isValid = true;
				let validationErrors = {}
				schema != null && schema.validate != null ? schema.validate(args).catch(function (err) {
					isValid = false;
					validationErrors = {
						status: 'Validation failed',
						errors: err.errors
					}
				}) : isValid;

				if (!isValid) {
					return validationErrors;
				}
				let validationResponse = validate.apply(undefined, [args, context]);
				if (validationResponse['status'] === true || validationResponse.status === 'true') {
					return resolveFunction.apply(undefined, [obj, args, context, info]);
				} else {
					if (Object.keys(validationResponse).includes('data')) {
						return validationResponse['data'];
					}
					return {
						status: 'Validation failed',
						message: validationResponse['message'],
						errors: []
					};
				}
			} else {
			}
		} catch (error) {
			console.log("Validation Resolve Error:")
			console.log("error");
			return resolveFunction.apply(undefined, [obj, args, context, info]);
			}
		};
}

export default {
	validatedQueries,
	validatedMutations,
	graphql_validate,
};
