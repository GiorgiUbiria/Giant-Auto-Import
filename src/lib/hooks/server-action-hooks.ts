import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
	createServerActionsKeyFactory,
	setupServerActionHooks,
} from "zsa-react-query";

export const QueryKeyFactory = createServerActionsKeyFactory({
	getCars: () => ["getCars"],
	getUsers: () => ["users"],
	getImages: () => ["users"],
	getCar: (vin: string) => ["car", vin],
	getUser: (id: string) => ["user", id],
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
