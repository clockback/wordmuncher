export interface AddTongueRequestAPI {
    proposedName: string;
    flag: string;
    applyAs?: "native" | "studying";
}

export interface AddTongueResponseAPI {
    success: boolean;
    tongueId: number;
}
