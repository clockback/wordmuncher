export interface DeleteCategoryRequestAPI {
    orphanBehavior: "move-to-parent" | "move-to-root" | "delete-all";
}

export type DeleteCategoryResponseAPI = { error?: string };
