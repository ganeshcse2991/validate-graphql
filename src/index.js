export const ValidatedQueries = {};
export const ValidatedMutations = {};

export function ValidateGraphql(queries, mutations) {
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
				ValidatedQueries[name] = schemaQueries[name];
			}
		});
	} catch (error) {
		console.log("Validation Query Error:");
		console.log(error);
		ValidatedQueries[schemaQueries]
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
					ValidatedMutations[name] = schemaMutations[name];
				}
			});
		} catch (error) {
			console.log("Validation Mutation Error:");
			console.log(error);
			ValidatedMutations[schemaMutations]
		}
}

function replace_resolver(validate, resolveFunction, validationSchema) {
	return async function (obj, args, context, info) {
		try {
			let validatorType = typeof validate;
			if (validate != null && validate != undefined && validatorType == 'function') {
				let isValid = true;
				let validationErrors = {}
				validationSchema != null && validationSchema.schema != null && validationSchema.schema.validate != null ? await validationSchema.schema.validate(args).catch(function (err) {
					isValid = false;
					validationErrors = {
						status: 'Validation failed',
					}
					validationErrors[validationSchema.error_field] = err.errors.join(", ")
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
				return resolveFunction.apply(undefined, [obj, args, context, info]);
			}
		} catch (error) {
			console.log("Validation Resolve Error:")
			console.log("error");
			return resolveFunction.apply(undefined, [obj, args, context, info]);
			}
		};
}

export default {
	ValidatedQueries,
	ValidatedMutations,
	ValidateGraphql,
};
