import { IOptions, IOptionsResult } from "./package.interface";

export const paginationCalculation = (options: IOptions): IOptionsResult => {
	//console.log('cal paginetions--', options);
	const page = Number(options.page || 1);
	const limit = Number(options.limit || 500);
	const skip = (page - 1) * limit;

	//sorting
	const sortBy = options.sortBy || 'createdAt';
	const sortOrder = options.sortOrder || 'desc';

	return {
		page,
		limit,
		skip,
		sortBy,
		sortOrder,
	};
};