import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createServerActionsKeyFactory,
  setupServerActionHooks,
} from "zsa-react-query";

export const QueryKeyFactory = createServerActionsKeyFactory({
  getCars: () => ["getCars"],
  getCarsForUser: (id: string) => ["getCarsForUser", id],
  getUsers: () => ["getUsers"],
  getImage: (vin: string) => ["getImage", vin],
  getImages: () => ["getImages"],
  getImagesForCar: (vin: string) => ["getImagesForCar", vin],
  getCar: (vin: string) => ["getCar", vin],
  getCarPublic: (vin: string) => ["getCarPublic", vin],
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
