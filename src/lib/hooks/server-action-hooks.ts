import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
	createServerActionsKeyFactory,
	setupServerActionHooks,
} from "zsa-react-query";

export const QueryKeyFactory = createServerActionsKeyFactory({
	getCars: () => ["getCars"],
	getUsers: () => ["getUsers"],
	getImages: () => ["getImages"],
	getCar: (vin: string) => ["getCar", vin],
	getUser: (id: string) => ["getUser", id],
});

const {
	useServerActionQuery,
	useServerActionMutation,
	useServerActionInfiniteQuery,
} = setupServerActionHooks({
	hooks: {
		useQuery: useQuery,
		useMutation: useMutation,
		useInfiniteQuery: useInfiniteQuery,
	},
	queryKeyFactory: QueryKeyFactory,
});

export {
	useServerActionInfiniteQuery,
	useServerActionMutation,
	useServerActionQuery,
};
